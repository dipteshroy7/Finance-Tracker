import { useState, useMemo, useCallback, useEffect } from 'react'
import useTransactionStore from '../../store/transactionStore'
import useUIStore from '../../store/uiStore'
import TransactionItem from './TransactionItem'
import MonthGroup from './MonthGroup'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'
import { formatCurrency, getMonthKey } from '../../utils/formatters'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Transaction, MonthGroup as MonthGroupType } from '../../types'

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1)
  const monthName = date.toLocaleDateString('en-US', { month: 'short' })
  return `${monthName}, ${year}`
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

  // Default to the latest month that has transaction data
  const latestMonthKey = useMemo(() => {
    if (transactions.length === 0) return getCurrentMonthKey()
    const keys = transactions.map((tx) => getMonthKey(tx.date))
    keys.sort((a, b) => b.localeCompare(a))
    return keys[0]
  }, [transactions])

  const [activeMonthKey, setActiveMonthKey] = useState<string>(() => getCurrentMonthKey())

  // When transactions load for the first time, jump to the latest month with data
  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!hasInitialized && transactions.length > 0) {
      setActiveMonthKey(latestMonthKey)
      setHasInitialized(true)
    }
  }, [transactions, latestMonthKey, hasInitialized])

  // Build the group for the currently selected month only
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
      {/* ── Month Navigator ── */}
      <div className="flex items-center justify-center gap-4 py-4 px-5 select-none">
        <button
          onClick={goBack}
          className="p-2 rounded-xl hover:bg-white/10 active:scale-90 text-muted-foreground hover:text-foreground transition-all"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-foreground min-w-[130px] text-center tabular-nums tracking-wide">
          {formatMonthLabel(activeMonthKey)}
        </h2>

        <button
          onClick={goForward}
          className="p-2 rounded-xl hover:bg-white/10 active:scale-90 text-muted-foreground hover:text-foreground transition-all"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Transaction List for Active Month ── */}
      {activeGroup ? (
        <div className="space-y-2 py-2 animate-fade-in">
          <MonthGroup
            label={activeGroup.label}
            totalIncome={activeGroup.totalIncome}
            totalExpense={activeGroup.totalExpense}
          />
          <div className="mx-4 md:mx-0 glass-card overflow-hidden divide-y divide-white/5 border border-white/5 shadow-xl shadow-black/20 rounded-2xl mb-8">
            {activeGroup.transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={(t) => openModal(t)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No transactions"
          description={`Nothing recorded for ${formatMonthLabel(activeMonthKey)}`}
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
