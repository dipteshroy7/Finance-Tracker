import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Account } from '../types'

interface AccountState {
  accounts: Account[]
  loading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  addAccount: (name: string) => Promise<Account>
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

  addAccount: async (name: string) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ name: name.trim() })
      .select()
      .single()
    if (error) throw error
    set((state) => ({ accounts: [...state.accounts, data] }))
    return data
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
