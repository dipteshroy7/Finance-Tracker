import { db } from '../lib/db'
import { supabase } from '../lib/supabaseClient'
import { syncLogger } from './syncLogger'
import type { Transaction, TransactionRecord, Account, Category } from '../types'

/** How long before cached data is considered stale (default 24 hours) */
export const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000

const SYNC_META_KEY = 'transactions_lastSyncedAt'
const PAGE_SIZE = 1000

/** Flag to ensure reference data (accounts/categories) is only fetched once per session */
let refDataSyncedThisSession = false

// Raw fields to select from Supabase (no joins, for sync/cache)
const RAW_FIELDS = 'id, date, type, amount, category_id, account_id, from_account_id, to_account_id, nos, created_at, updated_at, is_deleted'

export interface SyncResult {
  type: 'full' | 'delta'
  recordsSynced: number
  deletedCount: number
  timestamp: string
}

// ─── Metadata ──────────────────────────────────────────────

async function getLastSyncedAt(): Promise<string | null> {
  const meta = await db.syncMeta.get(SYNC_META_KEY)
  return meta?.value ?? null
}

async function setLastSyncedAt(timestamp: string): Promise<void> {
  await db.syncMeta.put({ key: SYNC_META_KEY, value: timestamp })
}

async function isStale(maxAgeMs = STALE_THRESHOLD_MS): Promise<boolean> {
  const lastSynced = await getLastSyncedAt()
  if (!lastSynced) return true
  return Date.now() - new Date(lastSynced).getTime() > maxAgeMs
}

// ─── Cache Loading ─────────────────────────────────────────

/** Load all cached accounts from IndexedDB */
async function loadCachedAccounts(): Promise<Account[]> {
  return db.accounts.orderBy('name').toArray()
}

/** Load all cached categories from IndexedDB */
async function loadCachedCategories(): Promise<Category[]> {
  return db.categories.orderBy('name').toArray()
}

/** Enrich raw transaction records with joined account/category objects */
function enrichRecords(
  records: TransactionRecord[],
  accountMap: Map<string, Account>,
  categoryMap: Map<string, Category>,
): Transaction[] {
  return records.map((r) => ({
    ...r,
    category: r.category_id ? categoryMap.get(r.category_id) ?? null : null,
    account: r.account_id ? accountMap.get(r.account_id) ?? null : null,
    from_account: r.from_account_id ? accountMap.get(r.from_account_id) ?? null : null,
    to_account: r.to_account_id ? accountMap.get(r.to_account_id) ?? null : null,
  }))
}

/** Load transactions from IndexedDB, enriched with cached accounts/categories */
async function loadCachedTransactions(): Promise<Transaction[]> {
  const [records, accounts, categories] = await Promise.all([
    db.transactions.orderBy('date').reverse().toArray(),
    db.accounts.toArray(),
    db.categories.toArray(),
  ])

  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return enrichRecords(records, accountMap, categoryMap)
}

// ─── Full Sync ─────────────────────────────────────────────

/** Fetch all non-deleted transactions from Supabase and replace IndexedDB cache */
async function fullSync(): Promise<SyncResult> {
  syncLogger.info('Starting full sync...')
  const startTime = Date.now()

  const allRecords: TransactionRecord[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('transactions')
      .select(RAW_FIELDS)
      .eq('is_deleted', false)
      .order('date', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    allRecords.push(...(data ?? []))
    hasMore = (data?.length ?? 0) === PAGE_SIZE
    from += PAGE_SIZE
  }

  // Replace all transactions in IndexedDB
  await db.transaction('rw', db.transactions, async () => {
    await db.transactions.clear()
    for (let i = 0; i < allRecords.length; i += 500) {
      await db.transactions.bulkPut(allRecords.slice(i, i + 500))
    }
  })

  const timestamp = new Date().toISOString()
  await setLastSyncedAt(timestamp)

  syncLogger.info(
    `Full sync complete: ${allRecords.length} records in ${Date.now() - startTime}ms`,
  )

  return { type: 'full', recordsSynced: allRecords.length, deletedCount: 0, timestamp }
}

// ─── Delta Sync ────────────────────────────────────────────

/** Fetch only records changed since lastSyncedAt and merge into IndexedDB */
async function deltaSync(): Promise<SyncResult> {
  const lastSynced = await getLastSyncedAt()
  if (!lastSynced) return fullSync()

  syncLogger.info(`Starting delta sync from ${lastSynced}...`)
  const startTime = Date.now()

  const allChanged: TransactionRecord[] = []
  let from = 0
  let hasMore = true

  // Paginate delta results in case of large changesets
  while (hasMore) {
    const { data, error } = await supabase
      .from('transactions')
      .select(RAW_FIELDS)
      .gt('updated_at', lastSynced)
      .order('updated_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    allChanged.push(...(data ?? []))
    hasMore = (data?.length ?? 0) === PAGE_SIZE
    from += PAGE_SIZE
  }

  if (allChanged.length === 0) {
    syncLogger.info('Delta sync: no changes')
    const timestamp = new Date().toISOString()
    await setLastSyncedAt(timestamp)
    return { type: 'delta', recordsSynced: 0, deletedCount: 0, timestamp }
  }

  const toUpsert: TransactionRecord[] = []
  const toDelete: string[] = []

  for (const record of allChanged) {
    if (record.is_deleted) {
      toDelete.push(record.id)
    } else {
      toUpsert.push(record)
    }
  }

  await db.transaction('rw', db.transactions, async () => {
    if (toUpsert.length > 0) await db.transactions.bulkPut(toUpsert)
    if (toDelete.length > 0) await db.transactions.bulkDelete(toDelete)
  })

  const timestamp = new Date().toISOString()
  await setLastSyncedAt(timestamp)

  syncLogger.info(
    `Delta sync complete: ${toUpsert.length} upserted, ${toDelete.length} deleted in ${Date.now() - startTime}ms`,
  )

  return {
    type: 'delta',
    recordsSynced: toUpsert.length,
    deletedCount: toDelete.length,
    timestamp,
  }
}

// ─── Reference Data Sync ──────────────────────────────────

/** Full-sync accounts and categories (small datasets) */
async function syncReferenceData(): Promise<void> {
  const [accountsRes, categoriesRes] = await Promise.all([
    supabase.from('accounts').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
  ])

  if (accountsRes.error) throw accountsRes.error
  if (categoriesRes.error) throw categoriesRes.error

  await db.transaction('rw', [db.accounts, db.categories], async () => {
    await db.accounts.clear()
    if (accountsRes.data?.length) await db.accounts.bulkPut(accountsRes.data)
    await db.categories.clear()
    if (categoriesRes.data?.length) await db.categories.bulkPut(categoriesRes.data)
  })

  syncLogger.debug(
    `Reference data synced: ${accountsRes.data?.length ?? 0} accounts, ${categoriesRes.data?.length ?? 0} categories`,
  )
}

// ─── Single Record Cache Ops ──────────────────────────────

/** Save or update a single transaction in IndexedDB */
async function saveTransactionToCache(record: TransactionRecord): Promise<void> {
  await db.transactions.put(record)
}

/** Remove a single transaction from IndexedDB */
async function removeTransactionFromCache(id: string): Promise<void> {
  await db.transactions.delete(id)
}

/** Save multiple transaction records to IndexedDB */
async function bulkSaveToCache(records: TransactionRecord[]): Promise<void> {
  await db.transaction('rw', db.transactions, async () => {
    for (let i = 0; i < records.length; i += 500) {
      await db.transactions.bulkPut(records.slice(i, i + 500))
    }
  })
}

// ─── Main Entry Point ─────────────────────────────────────

/**
 * Sync reference data (accounts/categories) only once per session.
 * Subsequent calls are no-ops unless forced.
 */
async function syncReferenceDataOnce(force = false): Promise<void> {
  if (refDataSyncedThisSession && !force) return
  await syncReferenceData()
  refDataSyncedThisSession = true
}

/**
 * Run a sync cycle. Syncs reference data once per session,
 * then performs full or delta sync on transactions.
 */
async function sync(forceFullSync = false): Promise<SyncResult> {
  // Sync reference data only once per session (or if forced)
  await syncReferenceDataOnce(forceFullSync)

  if (forceFullSync || (await isStale())) {
    return fullSync()
  }
  return deltaSync()
}

/**
 * Sync only transactions (skip reference data).
 * Used for periodic/background refreshes.
 */
async function syncTransactionsOnly(): Promise<SyncResult> {
  if (await isStale()) {
    return fullSync()
  }
  return deltaSync()
}

/** Clear all cached data and sync metadata */
async function clearCache(): Promise<void> {
  await db.transaction('rw', [db.transactions, db.accounts, db.categories, db.syncMeta], async () => {
    await db.transactions.clear()
    await db.accounts.clear()
    await db.categories.clear()
    await db.syncMeta.clear()
  })
  syncLogger.info('Cache cleared')
}

export const syncEngine = {
  // Metadata
  getLastSyncedAt,
  isStale,

  // Cache loading
  loadCachedTransactions,
  loadCachedAccounts,
  loadCachedCategories,

  // Sync operations
  sync,
  syncTransactionsOnly,
  fullSync,
  deltaSync,
  syncReferenceData,
  syncReferenceDataOnce,

  // Single record cache ops
  saveTransactionToCache,
  removeTransactionFromCache,
  bulkSaveToCache,

  // Cache management
  clearCache,
}
