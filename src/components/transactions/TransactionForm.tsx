import { useState, useEffect, useMemo } from 'react'
import type { TransactionType } from '../../types'
import useTransactionStore from '../../store/transactionStore'
import useCategoryStore from '../../store/categoryStore'
import useAccountStore from '../../store/accountStore'
import useUIStore from '../../store/uiStore'
import NumberPad from '../shared/NumberPad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toLocalDatetime, combineDatetime, formatCurrency } from '../../utils/formatters'
import { cn } from '@/lib/utils'

export default function TransactionForm() {
  const editingTransaction = useUIStore((s) => s.editingTransaction)
  const closeModal = useUIStore((s) => s.closeModal)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const categories = useCategoryStore((s) => s.categories)
  const accounts = useAccountStore((s) => s.accounts)

  const isEditing = !!editingTransaction
  const now = new Date()
  const defaultDate = now.toISOString().split('T')[0]
  const defaultTime = now.toTimeString().slice(0, 5)

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [nos, setNos] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [saving, setSaving] = useState(false)
  const [showNumPad, setShowNumPad] = useState(true)

  useEffect(() => {
    if (editingTransaction) {
      const tx = editingTransaction
      setType(tx.type)
      setAmount(Number(tx.amount))
      setCategoryId(tx.category_id ?? '')
      setAccountId(tx.account_id ?? '')
      setFromAccountId(tx.from_account_id ?? '')
      setToAccountId(tx.to_account_id ?? '')
      setNos(tx.nos ?? '')
      const { date: d, time: t } = toLocalDatetime(tx.date)
      setDate(d)
      setTime(t)
      setShowNumPad(false)
    }
  }, [editingTransaction])

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type)),
    [categories, type]
  )

  const amountColor =
    type === 'expense' ? 'text-destructive' : type === 'income' ? 'text-emerald-500' : 'text-primary'

  const handleSubmit = async () => {
    if (amount <= 0) return
    setSaving(true)
    try {
      const payload = {
        date: combineDatetime(date, time),
        type,
        amount,
        category_id: type === 'transfer' ? null : (categoryId || null),
        account_id: type === 'transfer' ? null : (accountId || null),
        from_account_id: type === 'transfer' ? (fromAccountId || null) : null,
        to_account_id: type === 'transfer' ? (toAccountId || null) : null,
        nos,
      }

      if (isEditing) {
        await updateTransaction(editingTransaction!.id, payload)
      } else {
        await addTransaction(payload)
      }
      closeModal()
    } catch (err) {
      console.error('Failed to save transaction:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* ── Transaction Type Tabs ── */}
      <div className="px-5 pt-5">
        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <TabsList className="w-full h-11 p-1">
            <TabsTrigger
              value="expense"
              className={cn(
                "flex-1 h-full text-sm font-medium",
                type === 'expense' && "!bg-destructive !text-white shadow-sm"
              )}
            >
              Expense
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn(
                "flex-1 h-full text-sm font-medium",
                type === 'income' && "!bg-emerald-500 !text-white shadow-sm"
              )}
            >
              Income
            </TabsTrigger>
            <TabsTrigger
              value="transfer"
              className={cn(
                "flex-1 h-full text-sm font-medium",
                type === 'transfer' && "!bg-primary !text-primary-foreground shadow-sm"
              )}
            >
              Transfer
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── Amount Display ── */}
      <button
        type="button"
        onClick={() => setShowNumPad(!showNumPad)}
        className="w-full py-6 px-5 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
      >
        <span className={cn("text-4xl font-bold tracking-tight", amountColor)}>
          {formatCurrency(amount)}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {showNumPad ? 'Tap to hide calculator' : 'Tap to show calculator'}
        </span>
      </button>

      {/* ── Calculator ── */}
      {showNumPad && (
        <div className="px-5 pb-5">
          <NumberPad value={amount} onChange={setAmount} />
        </div>
      )}

      {/* ── Form Fields ── */}
      <div className="px-5 pb-5 space-y-4">
        {type === 'transfer' ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                From Account
              </label>
              <Select value={fromAccountId} onValueChange={(v) => setFromAccountId(v || '')}>
                <SelectTrigger className="h-11 bg-secondary border-0">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                To Account
              </label>
              <Select value={toAccountId} onValueChange={(v) => setToAccountId(v || '')}>
                <SelectTrigger className="h-11 bg-secondary border-0">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v || '')}>
                <SelectTrigger className="h-11 bg-secondary border-0">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account
              </label>
              <Select value={accountId} onValueChange={(v) => setAccountId(v || '')}>
                <SelectTrigger className="h-11 bg-secondary border-0">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Notes
          </label>
          <Input
            value={nos}
            onChange={(e) => setNos(e.target.value)}
            placeholder="Add notes..."
            className="h-11 bg-secondary border-0"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 bg-secondary border-0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-11 bg-secondary border-0"
            />
          </div>
        </div>
      </div>

      {/* ── Submit Button ── */}
      <div className="px-5 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={
            saving ||
            amount <= 0 ||
            (type === 'transfer' ? (!fromAccountId || !toAccountId) : (!categoryId || !accountId))
          }
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </>
  )
}
