import { useState, useMemo, useCallback, useEffect } from 'react'
import useTransactionStore from '../../store/transactionStore'
import useUIStore from '../../store/uiStore'
import TransactionItem from './TransactionItem'
import MonthGroup from './MonthGroup'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'
import { getMonthKey } from '../../utils/formatters'
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
import type { MonthGroup as MonthGroupType } from '../../types'

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1)
  const monthName = date.toLocaleDateString('en-US', { month: 'long' })
  return `${monthName} ${year}`
}

function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonthKey(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month - 1 + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function TransactionList() {
  const loading = useTransactionStore((s) => s.loading)
  const transactions = useTransactionStore((s) => s.transactions)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const openModal = useUIStore((s) => s.openModal)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const latestMonthKey = useMemo(() => {
    if (transactions.length === 0) return getCurrentMonthKey()
    const keys = transactions.map((tx) => getMonthKey(tx.date))
    keys.sort((a, b) => b.localeCompare(a))
    return keys[0]
  }, [transactions])

  const [activeMonthKey, setActiveMonthKey] = useState<string>(() => getCurrentMonthKey())

  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!hasInitialized && transactions.length > 0) {
      setActiveMonthKey(latestMonthKey)
      setHasInitialized(true)
    }
  }, [transactions, latestMonthKey, hasInitialized])

  const activeGroup = useMemo<MonthGroupType | null>(() => {
    const txns = transactions.filter((tx) => getMonthKey(tx.date) === activeMonthKey)
    if (txns.length === 0) return null
    return {
      key: activeMonthKey,
      label: formatMonthLabel(activeMonthKey),
      transactions: txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      totalIncome: txns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      totalExpense: txns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    }
  }, [transactions, activeMonthKey])

  const goBack = useCallback(() => setActiveMonthKey((k) => shiftMonthKey(k, -1)), [])
  const goForward = useCallback(() => setActiveMonthKey((k) => shiftMonthKey(k, 1)), [])

  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* Month Navigator */}
      <div className="flex items-center justify-between py-2 select-none">
        <button
          onClick={goBack}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-base font-semibold text-foreground min-w-[160px] text-center tabular-nums">
          {formatMonthLabel(activeMonthKey)}
        </h2>

        <button
          onClick={goForward}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Transaction Feed */}
      {activeGroup ? (
        <div className="animate-fade-in">
          <MonthGroup
            label={activeGroup.label}
            totalIncome={activeGroup.totalIncome}
            totalExpense={activeGroup.totalExpense}
          />
          <div className="glass-card overflow-hidden divide-y divide-border mt-3">
            {activeGroup.transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={(t) => openModal(t)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>

          {/* Transaction count */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            {activeGroup.transactions.length} transaction{activeGroup.transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <EmptyState
          title="No transactions"
          description={`Nothing recorded for ${formatMonthLabel(activeMonthKey)}`}
          icon={Receipt}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteTransaction(deleteId)
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </>
  )
}
