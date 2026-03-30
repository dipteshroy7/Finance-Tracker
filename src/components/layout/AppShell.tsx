import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
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
    <div className="min-h-full gradient-surface text-text dark:text-text-dark">
      <TopBar />
      <main className="pb-28 min-h-full">
        <Outlet />
      </main>
      <BottomNav />
      <FAB />
      <TransactionModal />
    </div>
  )
}
