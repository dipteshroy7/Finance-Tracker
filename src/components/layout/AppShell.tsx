import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import FAB from '../shared/FAB'
import TransactionModal from '../transactions/TransactionModal'
import useTransactionStore from '../../store/transactionStore'
import useCategoryStore from '../../store/categoryStore'
import useAccountStore from '../../store/accountStore'

export default function AppShell() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
    fetchAccounts()
  }, [fetchTransactions, fetchCategories, fetchAccounts])

  return (
    <div className="flex min-h-screen gradient-surface text-text dark:text-text-dark">
      <SideNav />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pb-28 md:pb-10 min-h-full">
          {/* Max width wrapper for desktop readability */}
          <div className="max-w-4xl mx-auto w-full md:px-6">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
      <FAB />
      <TransactionModal />
    </div>
  )
}
