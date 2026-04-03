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
  const sync = useSync()
  const { isSyncing, isOnline, pendingMutations, refresh } = sync

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SideNav />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar sync={sync} />

        {/* Desktop sync status — minimal strip, only shows when needed */}
        <div className="hidden md:flex items-center justify-between px-6 h-8 text-xs border-b border-border">
          <div className="flex items-center gap-3">
            {!isOnline && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <WifiOff size={12} /> Offline
              </span>
            )}
            {isOnline && pendingMutations > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <CloudOff size={12} /> {pendingMutations} pending
              </span>
            )}
            {isOnline && pendingMutations === 0 && !isSyncing && (
              <span className="text-muted-foreground">All changes synced</span>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isSyncing || !isOnline}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors duration-150 cursor-pointer"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        <main className="flex-1 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-6">
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
