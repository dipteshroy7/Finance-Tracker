import Dexie, { type EntityTable } from 'dexie'
import type { TransactionRecord, Account, Category } from '../types'

export interface SyncMeta {
  key: string
  value: string
}

export interface OfflineQueueItem {
  id?: number
  operation: 'create' | 'update' | 'delete'
  table: string
  recordId: string
  payload: Record<string, unknown>
  createdAt: string
  retries: number
}

const db = new Dexie('FinanceTrackerDB') as Dexie & {
  transactions: EntityTable<TransactionRecord, 'id'>
  accounts: EntityTable<Account, 'id'>
  categories: EntityTable<Category, 'id'>
  syncMeta: EntityTable<SyncMeta, 'key'>
  offlineQueue: EntityTable<OfflineQueueItem, 'id'>
}

db.version(1).stores({
  transactions: 'id, date, type, category_id, account_id, updated_at',
  accounts: 'id, name',
  categories: 'id, name, type',
  syncMeta: 'key',
  offlineQueue: '++id, table, recordId',
})

export { db }
