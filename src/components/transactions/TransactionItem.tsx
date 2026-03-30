import type { Transaction } from '../../types'
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters'
import { TRANSACTION_COLORS } from '../../utils/constants'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

const typeIcons = {
  income: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
    </svg>
  ),
  expense: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m0 0l7-7m-7 7l-7-7" />
    </svg>
  ),
  transfer: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
}

const iconBg = {
  income: 'bg-income/15 text-income',
  expense: 'bg-expense/15 text-expense',
  transfer: 'bg-transfer/15 text-transfer',
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const { type, amount, category, account, from_account, to_account, nos, date } = transaction
  const color = TRANSACTION_COLORS[type]

  const accountLabel =
    type === 'transfer'
      ? `${from_account?.name ?? '?'} → ${to_account?.name ?? '?'}`
      : account?.name ?? ''

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-black/3 dark:hover:bg-white/3 active:bg-black/5 dark:active:bg-white/5 transition-colors duration-150 cursor-pointer"
      onClick={() => onEdit(transaction)}
    >
      {/* Type icon */}
      <div className={`w-10 h-10 rounded-xl ${iconBg[type]} flex items-center justify-center shrink-0`}>
        {typeIcons[type]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text dark:text-text-dark truncate">
            {category?.name ?? (type === 'transfer' ? 'Transfer' : 'Uncategorized')}
          </span>
          <span className={`text-sm font-bold ${color} shrink-0 tabular-nums`}>
            {type === 'expense' ? '-' : type === 'income' ? '+' : ''}
            {formatCurrency(Number(amount))}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-text-muted truncate">
            {accountLabel}{accountLabel && nos ? ' · ' : ''}{nos}
          </p>
          <span className="text-[10px] text-text-muted/60 shrink-0 ml-2 tabular-nums">
            {formatDate(date)}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
        className="p-2 rounded-xl hover:bg-expense/10 text-text-muted/40 hover:text-expense shrink-0 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
