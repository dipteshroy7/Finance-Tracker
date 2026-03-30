import { create } from 'zustand'
import type { Transaction } from '../types'

interface UIState {
  darkMode: boolean
  isModalOpen: boolean
  editingTransaction: Transaction | null
  toggleDarkMode: () => void
  openModal: (transaction?: Transaction | null) => void
  closeModal: () => void
}

const useUIStore = create<UIState>((set) => ({
  darkMode: localStorage.getItem('darkMode') !== 'false',
  isModalOpen: false,
  editingTransaction: null,

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode
      localStorage.setItem('darkMode', String(next))
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { darkMode: next }
    }),

  openModal: (transaction = null) =>
    set({ isModalOpen: true, editingTransaction: transaction ?? null }),

  closeModal: () =>
    set({ isModalOpen: false, editingTransaction: null }),
}))

// Initialize dark mode class on load
if (localStorage.getItem('darkMode') !== 'false') {
  document.documentElement.classList.add('dark')
}

export default useUIStore
