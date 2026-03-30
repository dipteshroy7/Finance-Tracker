import { useState, useEffect } from 'react'
import type { TransactionType } from '../../types'
import useTransactionStore from '../../store/transactionStore'
import useCategoryStore from '../../store/categoryStore'
import useAccountStore from '../../store/accountStore'
import useUIStore from '../../store/uiStore'
import NumberPad from '../shared/NumberPad'
import Button from '../ui/Button'
import { toLocalDatetime, combineDatetime } from '../../utils/formatters'

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

  const filteredCategories = categories
    .filter((c) => c.type === (type === 'transfer' ? 'expense' : type))

  const amountColor =
    type === 'expense' ? 'text-expense' : type === 'income' ? 'text-emerald-500' : 'text-primary-light'

  const tabStyles = {
    expense: 'bg-expense text-white shadow-sm',
    income: 'bg-emerald-500 text-white shadow-sm',
    transfer: 'bg-primary text-white shadow-sm',
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value)
  }

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

  /* ---- shared field styles ---- */
  const inputClass =
    'w-full h-11 rounded-lg bg-gray-100 dark:bg-white/8 border-0 px-4 text-sm text-text dark:text-text-dark placeholder-text-muted/60 outline-none focus:ring-2 focus:ring-primary/40 transition-all'

  return (
    <>
      {/* ── Transaction Type Tabs ── */}
      <div className="px-5 pt-5">
        <div className="flex w-full h-11 rounded-lg bg-gray-100 dark:bg-white/8 p-1 gap-1">
          {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 h-full text-sm font-medium rounded-md transition-all capitalize ${
                type === t ? tabStyles[t] : 'text-text-muted hover:text-text dark:hover:text-text-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Amount Display ── */}
      <button
        type="button"
        onClick={() => setShowNumPad(!showNumPad)}
        className="w-full py-6 px-5 flex flex-col items-center justify-center gap-1 hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
      >
        <span className={`text-4xl font-bold tracking-tight ${amountColor}`}>
          {formatCurrency(amount)}
        </span>
        <span className="text-xs text-text-muted mt-1">
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
      <div className="px-5 pb-5 space-y-3">
        {type === 'transfer' ? (
          <>
            {/* From Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                From Account
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select source account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            {/* To Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                To Account
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select destination account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {/* Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Notes
          </label>
          <input
            value={nos}
            onChange={(e) => setNos(e.target.value)}
            placeholder="Add notes..."
            className={inputClass}
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Submit Button ── */}
      <div className="px-5 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={saving || amount <= 0}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </>
  )
}
