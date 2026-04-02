import { db, type OfflineQueueItem } from '../lib/db'
import { supabase } from '../lib/supabaseClient'
import { syncLogger } from './syncLogger'

const MAX_RETRIES = 5

type QueueChangeCallback = (pendingCount: number) => void

let onChangeCallback: QueueChangeCallback | null = null
let onlineHandler: (() => void) | null = null

/** Set a callback that fires whenever the queue changes */
function onChange(cb: QueueChangeCallback | null) {
  onChangeCallback = cb
}

async function notifyChange() {
  if (onChangeCallback) {
    const count = await getPendingCount()
    onChangeCallback(count)
  }
}

/** Add a mutation to the offline queue */
async function enqueue(
  item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retries'>,
): Promise<void> {
  await db.offlineQueue.add({
    ...item,
    createdAt: new Date().toISOString(),
    retries: 0,
  })
  syncLogger.info(`Queued offline mutation: ${item.operation} on ${item.table}/${item.recordId}`)
  await notifyChange()
}

/** Get the number of pending mutations */
async function getPendingCount(): Promise<number> {
  return db.offlineQueue.count()
}

/** Get all pending queue items */
async function getAll(): Promise<OfflineQueueItem[]> {
  return db.offlineQueue.orderBy('id').toArray()
}

/** Process a single queue item against Supabase */
async function processItem(item: OfflineQueueItem): Promise<boolean> {
  try {
    switch (item.operation) {
      case 'create': {
        const { error } = await supabase
          .from(item.table)
          .insert(item.payload)
        if (error) throw error
        break
      }
      case 'update': {
        const { id: _id, ...updatePayload } = item.payload
        const { error } = await supabase
          .from(item.table)
          .update(updatePayload)
          .eq('id', item.recordId)
        if (error) throw error
        break
      }
      case 'delete': {
        const { error } = await supabase
          .from(item.table)
          .update({ is_deleted: true })
          .eq('id', item.recordId)
        if (error) throw error
        break
      }
    }
    return true
  } catch (err) {
    syncLogger.error(`Failed to process queue item ${item.id}:`, err)
    return false
  }
}

/** Process all pending mutations in FIFO order */
async function processQueue(): Promise<{ processed: number; failed: number }> {
  const items = await getAll()
  if (items.length === 0) return { processed: 0, failed: 0 }

  syncLogger.info(`Processing offline queue: ${items.length} items`)
  let processed = 0
  let failed = 0

  for (const item of items) {
    if (!navigator.onLine) {
      syncLogger.warn('Went offline during queue processing, stopping')
      break
    }

    const success = await processItem(item)

    if (success) {
      await db.offlineQueue.delete(item.id!)
      processed++
    } else {
      const newRetries = (item.retries ?? 0) + 1
      if (newRetries >= MAX_RETRIES) {
        syncLogger.error(
          `Queue item ${item.id} exceeded max retries, removing: ${item.operation} ${item.table}/${item.recordId}`,
        )
        await db.offlineQueue.delete(item.id!)
        failed++
      } else {
        await db.offlineQueue.update(item.id!, { retries: newRetries })
        failed++
      }
    }
  }

  syncLogger.info(`Queue processed: ${processed} succeeded, ${failed} failed`)
  await notifyChange()
  return { processed, failed }
}

/** Clear the entire offline queue */
async function clear(): Promise<void> {
  await db.offlineQueue.clear()
  await notifyChange()
}

/** Set up online/offline event listeners for automatic queue processing */
function setupListeners() {
  if (onlineHandler) return // Already set up

  onlineHandler = () => {
    syncLogger.info('Back online — processing offline queue')
    processQueue()
  }

  window.addEventListener('online', onlineHandler)
}

/** Tear down event listeners */
function teardownListeners() {
  if (onlineHandler) {
    window.removeEventListener('online', onlineHandler)
    onlineHandler = null
  }
}

export const offlineQueue = {
  enqueue,
  processQueue,
  getPendingCount,
  getAll,
  clear,
  onChange,
  setupListeners,
  teardownListeners,
}
