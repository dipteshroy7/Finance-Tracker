import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { syncEngine } from '../services/syncEngine'
import { offlineQueue } from '../services/offlineQueue'
import { syncLogger } from '../services/syncLogger'
import { db } from '../lib/db'
import type { Transaction, TransactionPayload, TransactionRecord } from '../types'
import useAccountStore from './accountStore'
import useCategoryStore from './categoryStore'

// Dedup guard: prevents concurrent fetches (e.g. React StrictMode double-mount)
let fetchInFlight: Promise<void> | null = null

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  addTransaction: (payload: TransactionPayload) => Promise<Transaction>
  updateTransaction: (id: string, payload: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  bulkInsertTransactions: (rows: TransactionPayload[]) => Promise<Transaction[]>
  refreshFromCache: () => Promise<void>
}

const SELECT_QUERY = `
  *,
  category:categories(*),
  account:accounts!transactions_account_id_fkey(*),
  from_account:accounts!transactions_from_account_id_fkey(*),
  to_account:accounts!transactions_to_account_id_fkey(*)
`

/** Strip joined relations to get a raw record for IndexedDB */
function toRecord(t: Transaction): TransactionRecord {
  const { category, account, from_account, to_account, ...record } = t
  return record
}

/** Enrich a payload into a full Transaction using current in-memory reference data */
function enrichPayload(id: string, payload: TransactionPayload): Transaction {
  const accounts = useAccountStore.getState().accounts
  const categories = useCategoryStore.getState().categories
  const now = new Date().toISOString()

  return {
    id,
    ...payload,
    created_at: now,
    updated_at: now,
    is_deleted: false,
    category: payload.category_id
      ? categories.find((c) => c.id === payload.category_id) ?? null
      : null,
    account: payload.account_id
      ? accounts.find((a) => a.id === payload.account_id) ?? null
      : null,
    from_account: payload.from_account_id
      ? accounts.find((a) => a.id === payload.from_account_id) ?? null
      : null,
    to_account: payload.to_account_id
      ? accounts.find((a) => a.id === payload.to_account_id) ?? null
      : null,
  }
}

/** Check if an error is likely a network issue rather than a data error */
function isNetworkError(err: unknown): boolean {
  if (!navigator.onLine) return true
  if (err instanceof TypeError) return true
  if (err instanceof Error && err.message.includes('Failed to fetch')) return true
  return false
}

/** Binary search insert position for date-descending sorted array */
function findInsertIndex(txns: Transaction[], date: string): number {
  let lo = 0
  let hi = txns.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (txns[mid].date > date) lo = mid + 1
    else hi = mid
  }
  return lo
}

const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  /**
   * Load all app data: cache-first, then single background sync.
   * Also populates account/category stores so no separate fetches are needed.
   */
  fetchTransactions: async () => {
    // Deduplicate: if already in flight (e.g. StrictMode), reuse the same promise
    if (fetchInFlight) return fetchInFlight
    fetchInFlight = (async () => {
      set({ error: null })

      // Step 1: Load ALL cached data for instant rendering
      try {
        const [cachedTxns, cachedAccounts, cachedCategories] = await Promise.all([
          syncEngine.loadCachedTransactions(),
          syncEngine.loadCachedAccounts(),
          syncEngine.loadCachedCategories(),
        ])
        if (cachedTxns.length > 0) {
          set({ transactions: cachedTxns, loading: false })
          syncLogger.info(`Loaded ${cachedTxns.length} transactions from cache`)
        } else {
          set({ loading: true })
        }
        // Populate reference-data stores from cache too
        if (cachedAccounts.length > 0) {
          useAccountStore.setState({ accounts: cachedAccounts, loading: false })
        }
        if (cachedCategories.length > 0) {
          useCategoryStore.setState({ categories: cachedCategories, loading: false })
        }
      } catch {
        set({ loading: true })
      }

      // Step 2: Single background sync (reference data + transactions)
      if (!navigator.onLine) {
        set({ loading: false })
        syncLogger.warn('Offline — skipping sync')
        return
      }

      try {
        const result = await syncEngine.sync()

        // Refresh ALL stores from updated cache
        const [freshTxns, freshAccounts, freshCategories] = await Promise.all([
          syncEngine.loadCachedTransactions(),
          syncEngine.loadCachedAccounts(),
          syncEngine.loadCachedCategories(),
        ])
        set({ transactions: freshTxns, loading: false })
        useAccountStore.setState({ accounts: freshAccounts, loading: false })
        useCategoryStore.setState({ categories: freshCategories, loading: false })

        syncLogger.info(
          `Sync complete (${result.type}): ${result.recordsSynced} synced, ${result.deletedCount} deleted`,
        )
      } catch (err: unknown) {
        syncLogger.warn('Background sync failed:', err)
        if (get().transactions.length === 0) {
          set({
            error: err instanceof Error ? err.message : 'Sync failed',
            loading: false,
          })
        } else {
          set({ loading: false })
        }
      }
    })()
    try { await fetchInFlight } finally { fetchInFlight = null }
  },

  /**
   * Optimistic add: update IndexedDB + state first, then persist to Supabase.
   * On network failure: queue for retry.
   */
  addTransaction: async (payload) => {
    const tempId = crypto.randomUUID()
    const optimistic = enrichPayload(tempId, payload)
    const record = toRecord(optimistic)

    // Optimistic update — state first (instant re-render), cache in background
    set((state) => {
      const idx = findInsertIndex(state.transactions, optimistic.date)
      const next = [...state.transactions]
      next.splice(idx, 0, optimistic)
      return { transactions: next }
    })
    syncEngine.saveTransactionToCache(record)

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({ id: tempId, ...payload })
        .select(SELECT_QUERY)
        .single()
      if (error) throw error

      // Replace optimistic record with server response
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === tempId ? data : t)),
      }))
      syncEngine.saveTransactionToCache(toRecord(data))
      return data
    } catch (err) {
      if (isNetworkError(err)) {
        // Keep optimistic state, queue for retry
        await offlineQueue.enqueue({
          operation: 'create',
          table: 'transactions',
          recordId: tempId,
          payload: { id: tempId, ...payload },
        })
        return optimistic
      }

      // Data error — rollback
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== tempId),
      }))
      syncEngine.removeTransactionFromCache(tempId)
      throw err
    }
  },

  /**
   * Optimistic update: apply changes locally, then persist to Supabase.
   */
  updateTransaction: async (id, payload) => {
    const { category, account, from_account, to_account, ...cleanPayload } =
      payload as Transaction

    // Snapshot for rollback
    const original = get().transactions.find((t) => t.id === id)
    if (!original) throw new Error(`Transaction ${id} not found`)

    // Optimistic update — state first (instant re-render), cache in background
    const updated = { ...original, ...payload }
    set((state) => {
      const filtered = state.transactions.filter((t) => t.id !== id)
      const idx = findInsertIndex(filtered, updated.date)
      const next = [...filtered]
      next.splice(idx, 0, updated)
      return { transactions: next }
    })
    syncEngine.saveTransactionToCache(toRecord(updated))

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(cleanPayload)
        .eq('id', id)
        .select(SELECT_QUERY)
        .single()
      if (error) throw error

      // Replace with server response
      set((state) => {
        const filtered = state.transactions.filter((t) => t.id !== id)
        const idx = findInsertIndex(filtered, data.date)
        const next = [...filtered]
        next.splice(idx, 0, data)
        return { transactions: next }
      })
      syncEngine.saveTransactionToCache(toRecord(data))
    } catch (err) {
      if (isNetworkError(err)) {
        await offlineQueue.enqueue({
          operation: 'update',
          table: 'transactions',
          recordId: id,
          payload: cleanPayload,
        })
        return
      }

      // Rollback on data error
      set((state) => {
        const filtered = state.transactions.filter((t) => t.id !== id)
        const idx = findInsertIndex(filtered, original.date)
        const next = [...filtered]
        next.splice(idx, 0, original)
        return { transactions: next }
      })
      syncEngine.saveTransactionToCache(toRecord(original))
      throw err
    }
  },

  /**
   * Optimistic delete: remove locally, soft-delete on Supabase.
   */
  deleteTransaction: async (id) => {
    // Snapshot for rollback
    const original = get().transactions.find((t) => t.id === id)

    // Optimistic remove — state first (instant re-render), cache in background
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
    syncEngine.removeTransactionFromCache(id)

    try {
      // Soft delete on Supabase (triggers updated_at, sets is_deleted=true)
      const { error } = await supabase
        .from('transactions')
        .update({ is_deleted: true })
        .eq('id', id)
      if (error) throw error
    } catch (err) {
      if (isNetworkError(err)) {
        await offlineQueue.enqueue({
          operation: 'delete',
          table: 'transactions',
          recordId: id,
          payload: {},
        })
        return
      }

      // Rollback on data error
      if (original) {
        set((state) => {
          const idx = findInsertIndex(state.transactions, original.date)
          const next = [...state.transactions]
          next.splice(idx, 0, original)
          return { transactions: next }
        })
        syncEngine.saveTransactionToCache(toRecord(original))
      }
      throw err
    }
  },

  /**
   * Bulk insert (CSV import): insert to Supabase, then cache results.
   * Not optimistic — waits for server confirmation since it's a deliberate batch operation.
   */
  bulkInsertTransactions: async (rows) => {
    if (rows.length === 0) return []

    const results: Transaction[] = []
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500)
      const { data, error } = await supabase
        .from('transactions')
        .insert(chunk)
        .select(SELECT_QUERY)
      if (error) throw error
      results.push(...(data ?? []))
    }

    // Save raw records to IndexedDB
    const records = results.map(toRecord)
    await syncEngine.bulkSaveToCache(records)

    set((state) => ({
      transactions: [...results, ...state.transactions].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    }))
    return results
  },

  /** Reload state from IndexedDB cache (used after external sync) */
  refreshFromCache: async () => {
    const transactions = await syncEngine.loadCachedTransactions()
    set({ transactions, loading: false })
  },
}))

export default useTransactionStore
