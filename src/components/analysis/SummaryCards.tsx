import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import useTransactionStore from '../../store/transactionStore'
import { formatCurrency } from '../../utils/formatters'

export default function SummaryCards() {
  const transactions = useTransactionStore((s) => s.transactions)

  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of transactions) {
      const amt = Number(t.amount)
      if (t.type === 'income') income += amt
      else if (t.type === 'expense') expense += amt
    }
    return { totalIncome: income, totalExpense: expense, netBalance: income - expense }
  }, [transactions])

  const cards = [
    {
      label: 'Income',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'text-income',
      bg: 'bg-income-subtle',
    },
    {
      label: 'Expense',
      amount: totalExpense,
      icon: TrendingDown,
      color: 'text-expense',
      bg: 'bg-expense-subtle',
    },
    {
      label: 'Net Savings',
      amount: netBalance,
      icon: Scale,
      color: netBalance >= 0 ? 'text-income' : 'text-expense',
      bg: netBalance >= 0 ? 'bg-income-subtle' : 'bg-expense-subtle',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
              <card.icon size={16} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </span>
          </div>
          <p className={`text-lg font-bold tabular-nums ${card.color}`}>
            {formatCurrency(card.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}
