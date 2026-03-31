import { useState, useMemo } from 'react'
import useTransactionStore from '../../store/transactionStore'
import useUIStore from '../../store/uiStore'
import TransactionItem from './TransactionItem'
import MonthGroup from './MonthGroup'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'
import { formatMonth, getMonthKey } from '../../utils/formatters'
import type { Transaction, MonthGroup as MonthGroupType } from '../../types'

export default function TransactionList() {
  const loading = useTransactionStore((s) => s.loading)
  const transactions = useTransactionStore((s) => s.transactions)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const openModal = useUIStore((s) => s.openModal)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of transactions) {
      const key = getMonthKey(tx.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    const result: MonthGroupType[] = []
    for (const [key, txns] of map) {
      result.push({
        key,
        label: formatMonth(txns[0].date),
        transactions: txns,
        totalIncome: txns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        totalExpense: txns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      })
    }
    return result.sort((a, b) => b.key.localeCompare(a.key))
  }, [transactions])

  if (loading) return <LoadingSpinner />

  if (groups.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Tap the + button to add your first transaction"
      />
    )
  }

  return (
    <>
      <div className="space-y-2 py-2">
        {groups.map((group) => (
          <div key={group.key}>
            <MonthGroup
              label={group.label}
              totalIncome={group.totalIncome}
              totalExpense={group.totalExpense}
            />
            <div className="mx-4 md:mx-0 glass-card overflow-hidden divide-y divide-white/5 border border-white/5 shadow-xl shadow-black/20 rounded-2xl mb-8">
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={(t) => openModal(t)}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

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
