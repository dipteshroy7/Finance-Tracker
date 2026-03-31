import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Account } from '../types'
import useTransactionStore from './transactionStore'

interface AccountState {
  accounts: Account[]
  loading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  addAccount: (name: string, initialAmount?: number, icon?: string) => Promise<Account>
  updateAccount: (id: string, updates: Partial<Pick<Account, 'name' | 'initial_amount' | 'icon'>>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  getOrCreateAccount: (name: string) => Promise<Account>
}

const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name')
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ accounts: data ?? [], loading: false })
    }
  },

  addAccount: async (name: string, initialAmount = 0, icon?: string) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ name: name.trim(), initial_amount: initialAmount, icon: icon ?? null })
      .select()
      .single()
    if (error) throw error
    set((state) => ({ accounts: [...state.accounts, data] }))
    return data
  },

  updateAccount: async (id: string, updates) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? data : a)),
    }))
    // Sync updated account into in-memory transactions
    const updated = data as Account
    useTransactionStore.setState((state) => ({
      transactions: state.transactions.map((t) => {
        let tx = t
        if (t.account?.id === id) tx = { ...tx, account: updated }
        if (t.from_account?.id === id) tx = { ...tx, from_account: updated }
        if (t.to_account?.id === id) tx = { ...tx, to_account: updated }
        return tx
      }),
    }))
  },

  deleteAccount: async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }))
  },

  getOrCreateAccount: async (name: string) => {
    const trimmed = name.trim()
    const existing = get().accounts.find(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (existing) return existing

    // Try upsert to handle race conditions
    const { data, error } = await supabase
      .from('accounts')
      .upsert({ name: trimmed }, { onConflict: 'name' })
      .select()
      .single()
    if (error) throw error
    // Update local state if new
    if (!get().accounts.find((a) => a.id === data.id)) {
      set((state) => ({ accounts: [...state.accounts, data] }))
    }
    return data
  },
}))

export default useAccountStore
