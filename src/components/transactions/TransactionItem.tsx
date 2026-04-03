import { Trash2, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TRANSACTION_COLORS } from '../../utils/constants'
import { getIconComponent } from '../../utils/categoryIcons'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

const iconBg = {
  income: 'bg-income-subtle text-income',
  expense: 'bg-expense-subtle text-expense',
  transfer: 'bg-transfer-subtle text-transfer',
} as const

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const { type, amount, category, account, from_account, to_account, nos, date } = transaction
  const color = TRANSACTION_COLORS[type]

  const accountLabel =
    type === 'transfer'
      ? `${from_account?.name ?? '?'} → ${to_account?.name ?? '?'}`
      : account?.name ?? ''

  let IconEl: React.ReactNode
  if (type === 'transfer') {
    IconEl = <ArrowRightLeft size={18} />
  } else if (category?.icon) {
    const Icon = getIconComponent(category.icon)
    IconEl = <Icon size={18} />
  } else if (type === 'income') {
    IconEl = <TrendingUp size={18} />
  } else {
    IconEl = <TrendingDown size={18} />
  }

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 hover:bg-accent/50 active:bg-accent transition-colors duration-150 cursor-pointer"
      onClick={() => onEdit(transaction)}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${iconBg[type]} flex items-center justify-center shrink-0`}>
        {IconEl}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {category?.name ?? (type === 'transfer' ? 'Transfer' : 'Uncategorized')}
          </span>
          <span className={`text-sm font-semibold ${color} shrink-0 tabular-nums`}>
            {type === 'expense' ? '-' : type === 'income' ? '+' : ''}
            {formatCurrency(Number(amount))}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {accountLabel}{accountLabel && nos ? ' · ' : ''}{nos}
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0 ml-2 tabular-nums">
            {formatDate(date)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
        className="p-2 rounded-lg md:opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 transition-all duration-150 cursor-pointer"
        aria-label="Delete transaction"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
