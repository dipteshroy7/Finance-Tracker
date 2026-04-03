import { useLocation } from 'react-router-dom'
import { Sun, Moon, RefreshCw, WifiOff, CloudOff } from 'lucide-react'
import useDarkMode from '../../hooks/useDarkMode'
import type { UseSyncReturn } from '../../hooks/useSync'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Transactions',
  '/accounts': 'Accounts',
  '/analysis': 'Analysis',
  '/import-export': 'Import / Export',
  '/categories': 'Categories',
}

interface TopBarProps {
  sync: UseSyncReturn
}

export default function TopBar({ sync }: TopBarProps) {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Finance Tracker'
  const { isSyncing, isOnline, pendingMutations, refresh } = sync

  const hasWarning = !isOnline || pendingMutations > 0

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 z-30 glass pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {hasWarning && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              {!isOnline && <WifiOff size={14} />}
              {isOnline && pendingMutations > 0 && <CloudOff size={14} />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            disabled={isSyncing || !isOnline}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 disabled:opacity-40 cursor-pointer"
            aria-label="Sync data"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
