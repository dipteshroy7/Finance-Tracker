import { useState, useMemo } from 'react'
import { Plus, Wallet } from 'lucide-react'
import type { Account } from '../../types'
import useAccountStore from '../../store/accountStore'
import useTransactionStore from '../../store/transactionStore'
import AccountItem from './AccountItem'
import AccountForm from './AccountForm'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import TransactionListDrawer from '../shared/TransactionListDrawer'
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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const balanceMap = useMemo(
    () => computeAccountBalances(accounts, transactions),
    [accounts, transactions],
  )

  const selectedTransactions = useMemo(() => {
    if (!selectedAccount) return []
    return transactions
      .filter((tx) =>
        tx.account_id === selectedAccount.id ||
        tx.from_account_id === selectedAccount.id ||
        tx.to_account_id === selectedAccount.id
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, selectedAccount])

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </h2>
        <Button
          onClick={() => {
            setEditingAccount(null)
            setShowForm(true)
          }}
          size="sm"
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts"
          description="Add an account to start tracking your finances"
          icon={Wallet}
        />
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-border">
          {accounts.map((acc) => (
            <AccountItem
              key={acc.id}
              account={acc}
              balance={balanceMap.get(acc.id) ?? 0}
              onSelect={(a) => setSelectedAccount(a)}
              onEdit={(a) => {
                setEditingAccount(a)
                setShowForm(true)
              }}
              onDelete={(a) => setDeletingAccount(a)}
            />
          ))}
        </div>
      )}

      {/* Transaction list drawer for selected account */}
      <TransactionListDrawer
        open={!!selectedAccount}
        onOpenChange={(open) => { if (!open) setSelectedAccount(null) }}
        title={selectedAccount?.name ?? ''}
        transactions={selectedTransactions}
      />

      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border bg-card">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'New Account'}
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
