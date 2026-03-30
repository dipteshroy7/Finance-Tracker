import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TRANSACTION_COLORS } from '../../utils/constants'
import { 
  Utensils, Droplet, Zap, Wifi, ShoppingBag, HeartPulse, GraduationCap,
  Car, Train, Home, Smartphone, Coffee, Gift, Briefcase, IndianRupee, HelpCircle, ArrowRightLeft, TrendingUp, TrendingDown
} from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

const getCategoryIcon = (categoryName: string | undefined, type: string) => {
  if (type === 'transfer') return <ArrowRightLeft className="w-5 h-5" />
  
  if (!categoryName) {
    return type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />
  }

  const name = categoryName.toLowerCase()
  
  if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) return <Utensils className="w-5 h-5" />
  if (name.includes('water')) return <Droplet className="w-5 h-5" />
  if (name.includes('electric') || name.includes('power')) return <Zap className="w-5 h-5" />
  if (name.includes('internet') || name.includes('wifi') || name.includes('broadband')) return <Wifi className="w-5 h-5" />
  if (name.includes('shopping') || name.includes('clothes')) return <ShoppingBag className="w-5 h-5" />
  if (name.includes('health') || name.includes('medical') || name.includes('doctor')) return <HeartPulse className="w-5 h-5" />
  if (name.includes('education') || name.includes('school')) return <GraduationCap className="w-5 h-5" />
  if (name.includes('fuel') || name.includes('gas') || name.includes('car')) return <Car className="w-5 h-5" />
  if (name.includes('transit') || name.includes('transport') || name.includes('train')) return <Train className="w-5 h-5" />
  if (name.includes('home') || name.includes('rent')) return <Home className="w-5 h-5" />
  if (name.includes('phone') || name.includes('mobile')) return <Smartphone className="w-5 h-5" />
  if (name.includes('coffee') || name.includes('cafe')) return <Coffee className="w-5 h-5" />
  if (name.includes('gift') || name.includes('donation')) return <Gift className="w-5 h-5" />
  if (name.includes('salary') || name.includes('work') || name.includes('business')) return <Briefcase className="w-5 h-5" />
  if (name.includes('investment') || name.includes('interest')) return <IndianRupee className="w-5 h-5" />
  
  return type === 'income' ? <TrendingUp className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />
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
      className="group flex items-center gap-4 px-5 py-4 hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(transaction)}
    >
      {/* Type icon */}
      <div className={`w-11 h-11 rounded-2xl ${iconBg[type]} flex items-center justify-center shrink-0 shadow-inner`}>
        {getCategoryIcon(category?.name, type)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-foreground truncate">
            {category?.name ?? (type === 'transfer' ? 'Transfer' : 'Uncategorized')}
          </span>
          <span className={`text-[15px] font-bold ${color} shrink-0 tabular-nums tracking-tight`}>
            {type === 'expense' ? '-' : type === 'income' ? '+' : ''}
            {formatCurrency(Number(amount))}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[13px] text-muted-foreground truncate">
            {accountLabel}{accountLabel && nos ? ' · ' : ''}{nos}
          </p>
          <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 ml-2 tabular-nums uppercase tracking-wider">
            {formatDate(date)}
          </span>
        </div>
      </div>

      {/* Delete button (only visible on hover on larger screens) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
        className="p-2.5 rounded-xl md:opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 transition-all active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
