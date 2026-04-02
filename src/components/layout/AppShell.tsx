import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { RefreshCw, WifiOff, CloudOff } from 'lucide-react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import FAB from '../shared/FAB'
import TransactionModal from '../transactions/TransactionModal'
import useTransactionStore from '../../store/transactionStore'
import { useSync } from '../../hooks/useSync'

export default function AppShell() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const { isSyncing, isOnline, pendingMutations, refresh } = useSync()

  // Single entry point: loads all data (transactions + accounts + categories)
  // from IndexedDB cache first, then runs one background sync.
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="flex min-h-screen gradient-surface text-text dark:text-text-dark">
      <SideNav />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        {/* Sync status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 text-xs border-b border-border/30 dark:border-border-dark/30 bg-surface/50 dark:bg-surface-dark/50">
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <WifiOff size={12} />
                Offline
              </span>
            )}
            {pendingMutations > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <CloudOff size={12} />
                {pendingMutations} pending
              </span>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isSyncing || !isOnline}
            className="flex items-center gap-1 text-text-secondary dark:text-text-secondary-dark hover:text-text dark:hover:text-text-dark disabled:opacity-40 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

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
