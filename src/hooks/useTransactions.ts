import useTransactionStore from '../store/transactionStore'
import type { Transaction, TransactionPayload } from '../types'

export interface UseTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  addTransaction: (payload: TransactionPayload) => Promise<Transaction>
  updateTransaction: (id: string, payload: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  bulkInsertTransactions: (rows: TransactionPayload[]) => Promise<Transaction[]>
}

/**
 * Convenience hook for transaction CRUD.
 *
 * Wraps the Zustand transaction store with a stable API.
 * Mutations are optimistic — IndexedDB is updated first, then Supabase.
 * If offline, mutations are queued for retry.
 */
export function useTransactions(): UseTransactionsReturn {
  const transactions = useTransactionStore((s) => s.transactions)
  const loading = useTransactionStore((s) => s.loading)
  const error = useTransactionStore((s) => s.error)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const bulkInsertTransactions = useTransactionStore((s) => s.bulkInsertTransactions)

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkInsertTransactions,
  }
}
