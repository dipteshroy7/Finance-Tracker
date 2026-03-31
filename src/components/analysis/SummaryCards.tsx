import { useMemo } from 'react'
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
    { label: 'Income', amount: totalIncome, gradient: 'gradient-income', icon: '↑' },
    { label: 'Expense', amount: totalExpense, gradient: 'gradient-expense', icon: '↓' },
    { label: 'Balance', amount: netBalance, gradient: 'gradient-balance', icon: '≡' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`${card.gradient} rounded-2xl px-3 py-4 shadow-lg`}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-white/60 text-base">{card.icon}</span>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {card.label}
            </p>
          </div>
          <p className="text-base font-extrabold text-white tabular-nums leading-tight">
            {formatCurrency(card.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}
