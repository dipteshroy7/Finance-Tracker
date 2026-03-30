import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Transaction, MonthGroup } from '../types'
import { formatMonth, getMonthKey } from '../utils/formatters'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  addTransaction: (payload: Omit<Transaction, 'id' | 'created_at' | 'category' | 'account' | 'from_account' | 'to_account'>) => Promise<Transaction>
  updateTransaction: (id: string, payload: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  bulkInsertTransactions: (rows: Omit<Transaction, 'id' | 'created_at' | 'category' | 'account' | 'from_account' | 'to_account'>[]) => Promise<Transaction[]>
  getGroupedByMonth: () => MonthGroup[]
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
    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT_QUERY)
      .order('date', { ascending: false })
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ transactions: data ?? [], loading: false })
    }
  },

  addTransaction: async (payload) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select(SELECT_QUERY)
      .single()
    if (error) throw error
    set((state) => ({
      transactions: [data, ...state.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
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
    set((state) => ({
      transactions: state.transactions
        .map((t) => (t.id === id ? data : t))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }))
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
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    return results
  },

  getGroupedByMonth: () => {
    const txns = get().transactions
    const map = new Map<string, Transaction[]>()

    for (const tx of txns) {
      const key = getMonthKey(tx.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }

    const groups: MonthGroup[] = []
    for (const [key, transactions] of map) {
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      groups.push({
        key,
        label: formatMonth(transactions[0].date),
        transactions,
        totalIncome,
        totalExpense,
      })
    }

    return groups.sort((a, b) => b.key.localeCompare(a.key))
  },
}))

export default useTransactionStore
