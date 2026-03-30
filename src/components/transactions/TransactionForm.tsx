import { useState, useEffect } from 'react'
import type { TransactionType, Transaction } from '../../types'
import useTransactionStore from '../../store/transactionStore'
import useCategoryStore from '../../store/categoryStore'
import useAccountStore from '../../store/accountStore'
import useUIStore from '../../store/uiStore'
import NumberPad from '../shared/NumberPad'
import Select from '../ui/Select'
import Input from '../ui/Input'
import DatePicker from '../ui/DatePicker'
import Button from '../ui/Button'
import { toLocalDatetime, combineDatetime } from '../../utils/formatters'

const TYPE_TABS: { value: TransactionType; label: string; activeClass: string }[] = [
  { value: 'expense', label: 'Expense', activeClass: 'gradient-expense text-white shadow-lg shadow-expense/20' },
  { value: 'income', label: 'Income', activeClass: 'gradient-income text-white shadow-lg shadow-income/20' },
  { value: 'transfer', label: 'Transfer', activeClass: 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-transfer/20' },
]

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
  const [showNumPad, setShowNumPad] = useState(false)

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
    }
  }, [editingTransaction])

  const filteredCategories = categories
    .filter((c) => c.type === (type === 'transfer' ? 'expense' : type))
    .map((c) => ({ value: c.id, label: c.name }))

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))

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
    <div className="px-6 pt-5 pb-10">
      {/* Type tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1.5 gap-1.5">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setType(tab.value)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
              type === tab.value
                ? tab.activeClass
                : 'text-text-muted hover:text-text-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amount display */}
      <button
        type="button"
        onClick={() => setShowNumPad(!showNumPad)}
        className="w-full mt-5 glass-card px-5 py-5 text-center"
      >
        <p className="text-3xl font-extrabold text-text-dark tabular-nums">
          ₹{amount ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
        </p>
        <p className="text-[10px] text-primary-light font-semibold mt-2">
          {showNumPad ? 'Tap to hide calculator' : 'Tap to use calculator'}
        </p>
      </button>

      {showNumPad && (
        <div className="mt-4">
          <NumberPad value={amount} onChange={setAmount} />
        </div>
      )}

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Form fields */}
      <div className="space-y-5">
        {type === 'transfer' ? (
          <>
            <Select
              label="From Account"
              id="from-account"
              options={accountOptions}
              placeholder="Select source account"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
            />
            <Select
              label="To Account"
              id="to-account"
              options={accountOptions}
              placeholder="Select destination account"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            />
          </>
        ) : (
          <>
            <Select
              label="Category"
              id="category"
              options={filteredCategories}
              placeholder="Select category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            <Select
              label="Account"
              id="account"
              options={accountOptions}
              placeholder="Select account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </>
        )}

        <Input
          label="Notes"
          id="notes"
          value={nos}
          onChange={(e) => setNos(e.target.value)}
          placeholder="Add notes..."
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="time" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Time
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-dark outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={saving || amount <= 0}
        className="w-full mt-8"
        size="lg"
      >
        {saving ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </div>
  )
}
