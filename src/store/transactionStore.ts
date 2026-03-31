import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Transaction } from '../types'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  addTransaction: (payload: Omit<Transaction, 'id' | 'created_at' | 'category' | 'account' | 'from_account' | 'to_account'>) => Promise<Transaction>
  updateTransaction: (id: string, payload: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  bulkInsertTransactions: (rows: Omit<Transaction, 'id' | 'created_at' | 'category' | 'account' | 'from_account' | 'to_account'>[]) => Promise<Transaction[]>
}

const SELECT_QUERY = `
  *,
  category:categories(*),
  account:accounts!transactions_account_id_fkey(*),
  from_account:accounts!transactions_from_account_id_fkey(*),
  to_account:accounts!transactions_to_account_id_fkey(*)
`

const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    const allData: Transaction[] = []
    const PAGE_SIZE = 1000
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('transactions')
        .select(SELECT_QUERY)
        .order('date', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)
      if (error) {
        set({ error: error.message, loading: false })
        return
      }
      allData.push(...(data ?? []))
      hasMore = (data?.length ?? 0) === PAGE_SIZE
      from += PAGE_SIZE
    }

    set({ transactions: allData, loading: false })
  },

  addTransaction: async (payload) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select(SELECT_QUERY)
      .single()
    if (error) throw error
    // Insert into already-sorted array using binary search
    set((state) => {
      const txns = state.transactions
      const newDate = data.date
      let lo = 0, hi = txns.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (txns[mid].date > newDate) lo = mid + 1
        else hi = mid
      }
      const next = [...txns]
      next.splice(lo, 0, data)
      return { transactions: next }
    })
    return data
  },

  updateTransaction: async (id, payload) => {
    const { category, account, from_account, to_account, ...cleanPayload } = payload as Transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(cleanPayload)
      .eq('id', id)
      .select(SELECT_QUERY)
      .single()
    if (error) throw error
    set((state) => {
      const filtered = state.transactions.filter((t) => t.id !== id)
      const newDate = data.date
      let lo = 0, hi = filtered.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (filtered[mid].date > newDate) lo = mid + 1
        else hi = mid
      }
      const next = [...filtered]
      next.splice(lo, 0, data)
      return { transactions: next }
    })
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },

  bulkInsertTransactions: async (rows) => {
    if (rows.length === 0) return []
    // Supabase has a row limit per insert, batch in chunks of 500
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
    set((state) => ({
      transactions: [...results, ...state.transactions].sort(
        (a, b) => b.date.localeCompare(a.date)
      ),
    }))
    return results
  },

}))

export default useTransactionStore
