import { create } from 'zustand'
import type { Transaction } from '../types'

interface UIState {
  darkMode: boolean
  sidebarCollapsed: boolean
  isModalOpen: boolean
  editingTransaction: Transaction | null
  toggleDarkMode: () => void
  toggleSidebar: () => void
  openModal: (transaction?: Transaction | null) => void
  closeModal: () => void
}

const useUIStore = create<UIState>((set) => ({
  darkMode: localStorage.getItem('darkMode') !== 'false',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
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

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', String(next))
      return { sidebarCollapsed: next }
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
