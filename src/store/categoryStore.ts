import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Category, CategoryType } from '../types'
import useTransactionStore from './transactionStore'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (name: string, type: CategoryType, icon?: string) => Promise<Category>
  updateCategory: (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getOrCreateCategory: (name: string, type: CategoryType) => Promise<Category>
}

const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ categories: data ?? [], loading: false })
    }
  },

  addCategory: async (name: string, type: CategoryType, icon?: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), type, icon: icon ?? null })
      .select()
      .single()
    if (error) throw error
    set((state) => ({ categories: [...state.categories, data] }))
    return data
  },

  updateCategory: async (id: string, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? data : c)),
    }))
    // Sync updated category into in-memory transactions
    const updatedCategory = data as Category
    useTransactionStore.setState((state) => ({
      transactions: state.transactions.map((t) =>
        t.category?.id === id ? { ...t, category: updatedCategory } : t
      ),
    }))
  },

  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }))
  },

  getOrCreateCategory: async (name: string, type: CategoryType) => {
    const trimmed = name.trim()
    const existing = get().categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === type
    )
    if (existing) return existing

    const { data, error } = await supabase
      .from('categories')
      .upsert(
        { name: trimmed, type },
        { onConflict: 'name,type' }
      )
      .select()
      .single()
    if (error) throw error
    if (!get().categories.find((c) => c.id === data.id)) {
      set((state) => ({ categories: [...state.categories, data] }))
    }
    return data
  },
}))

export default useCategoryStore
