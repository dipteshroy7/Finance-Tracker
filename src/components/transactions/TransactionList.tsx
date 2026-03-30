import { useState } from 'react'
import useTransactionStore from '../../store/transactionStore'
import useUIStore from '../../store/uiStore'
import TransactionItem from './TransactionItem'
import MonthGroup from './MonthGroup'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'

export default function TransactionList() {
  const loading = useTransactionStore((s) => s.loading)
  const getGroupedByMonth = useTransactionStore((s) => s.getGroupedByMonth)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const openModal = useUIStore((s) => s.openModal)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const groups = getGroupedByMonth()

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
