import { useState, useEffect, useCallback, useRef } from 'react'
import { syncEngine } from '../services/syncEngine'
import { offlineQueue } from '../services/offlineQueue'
import { syncLogger } from '../services/syncLogger'
import useTransactionStore from '../store/transactionStore'
import useAccountStore from '../store/accountStore'
import useCategoryStore from '../store/categoryStore'

/** Background sync interval in ms (default 5 minutes) */
const BACKGROUND_SYNC_INTERVAL = 5 * 60 * 1000

export interface UseSyncReturn {
  isSyncing: boolean
  lastSyncedAt: string | null
  isOnline: boolean
  pendingMutations: number
  /** Trigger an incremental sync */
  refresh: () => Promise<void>
  /** Force a full sync (re-downloads everything) */
  forceFullSync: () => Promise<void>
}

export function useSync(): UseSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingMutations, setPendingMutations] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Refresh transaction store from the IndexedDB cache
  const refreshTransactionsFromCache = useCallback(async () => {
    const transactions = await syncEngine.loadCachedTransactions()
    useTransactionStore.setState({ transactions, loading: false })
  }, [])

  // Refresh all stores from the IndexedDB cache (for full sync)
  const refreshAllStoresFromCache = useCallback(async () => {
    const [transactions, accounts, categories] = await Promise.all([
      syncEngine.loadCachedTransactions(),
      syncEngine.loadCachedAccounts(),
      syncEngine.loadCachedCategories(),
    ])
    useTransactionStore.setState({ transactions, loading: false })
    useAccountStore.setState({ accounts, loading: false })
    useCategoryStore.setState({ categories, loading: false })
  }, [])

  // Run a sync cycle and refresh stores
  const runSync = useCallback(
    async (force = false) => {
      if (isSyncing || !navigator.onLine) return
      setIsSyncing(true)
      try {
        // Process any pending offline mutations first
        const queueCount = await offlineQueue.getPendingCount()
        if (queueCount > 0) {
          await offlineQueue.processQueue()
        }

        if (force) {
          // Full sync: re-fetch accounts, categories, and all transactions
          const result = await syncEngine.sync(true)
          await refreshAllStoresFromCache()
          setLastSyncedAt(result.timestamp)
          syncLogger.info(
            `Full sync: ${result.recordsSynced} synced, ${result.deletedCount} deleted`,
          )
        } else {
          // Incremental: only sync transactions (accounts/categories already loaded)
          const result = await syncEngine.syncTransactionsOnly()
          await refreshTransactionsFromCache()
          setLastSyncedAt(result.timestamp)
          syncLogger.info(
            `Tx sync: ${result.recordsSynced} synced, ${result.deletedCount} deleted`,
          )
        }
      } catch (err) {
        syncLogger.error('Sync failed:', err)
      } finally {
        setIsSyncing(false)
      }
    },
    [isSyncing, refreshTransactionsFromCache, refreshAllStoresFromCache],
  )

  const refresh = useCallback(() => runSync(false), [runSync])
  const forceFullSync = useCallback(() => runSync(true), [runSync])

  useEffect(() => {
    // Load initial sync timestamp
    syncEngine.getLastSyncedAt().then(setLastSyncedAt)

    // Load initial pending count
    offlineQueue.getPendingCount().then(setPendingMutations)

    // Subscribe to queue changes
    offlineQueue.onChange(setPendingMutations)

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true)
      syncLogger.info('Back online')
    }
    const handleOffline = () => {
      setIsOnline(false)
      syncLogger.warn('Went offline')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Setup offline queue auto-processing
    offlineQueue.setupListeners()

    // Background sync on visibility change (tab becomes visible)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncLogger.debug('Tab visible — triggering background sync')
        runSync(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Periodic background sync
    intervalRef.current = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        syncLogger.debug('Periodic background sync')
        runSync(false)
      }
    }, BACKGROUND_SYNC_INTERVAL)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
      offlineQueue.teardownListeners()
      offlineQueue.onChange(null)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { isSyncing, lastSyncedAt, isOnline, pendingMutations, refresh, forceFullSync }
}
