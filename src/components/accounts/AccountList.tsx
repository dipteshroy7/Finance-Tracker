import { useState, useMemo } from 'react'
import type { Account } from '../../types'
import useAccountStore from '../../store/accountStore'
import useTransactionStore from '../../store/transactionStore'
import AccountItem from './AccountItem'
import AccountForm from './AccountForm'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { computeAccountBalances } from '../../utils/accountBalances'

export default function AccountList() {
  const accounts = useAccountStore((s) => s.accounts)
  const loading = useAccountStore((s) => s.loading)
  const deleteAccount = useAccountStore((s) => s.deleteAccount)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const transactions = useTransactionStore((s) => s.transactions)

  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  const balanceMap = useMemo(
    () => computeAccountBalances(accounts, transactions),
    [accounts, transactions]
  )

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="px-4 pt-5">
        <Button
          onClick={() => {
            setEditingAccount(null)
            setShowForm(true)
          }}
          className="w-full"
        >
          + Add account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts"
          description="Add an account to start tracking your finances"
        />
      ) : (
        <div className="mx-4 md:mx-0 mt-4 rounded-2xl glass-card overflow-hidden divide-y divide-white/5 border border-white/5 shadow-xl shadow-black/20 mb-8">
          {accounts.map((acc) => (
            <AccountItem
              key={acc.id}
              account={acc}
              balance={balanceMap.get(acc.id) ?? 0}
              onEdit={(a) => {
                setEditingAccount(a)
                setShowForm(true)
              }}
              onDelete={(a) => setDeletingAccount(a)}
            />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-white/10 glass-card">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">
              {editingAccount ? 'Edit Account' : 'Create Account'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingAccount ? 'Edit an existing account' : 'Create a new account'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-hidden">
            <AccountForm
              editingAccount={editingAccount}
              onClose={() => setShowForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={async () => {
          if (deletingAccount) {
            await deleteAccount(deletingAccount.id)
            fetchTransactions()
          }
        }}
        title="Delete Account"
        message={`Deleting "${deletingAccount?.name}" will permanently delete all transactions associated with this account. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </>
  )
}
