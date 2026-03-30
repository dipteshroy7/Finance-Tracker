import { formatCurrency } from '../../utils/formatters'

interface MonthGroupProps {
  label: string
  totalIncome: number
  totalExpense: number
}

export default function MonthGroup({ label, totalIncome, totalExpense }: MonthGroupProps) {
  return (
    <div className="sticky top-0 z-10 glass px-5 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text dark:text-text-dark">{label}</h3>
        <div className="flex items-center gap-3 text-xs tabular-nums font-semibold">
          <span className="text-income">+{formatCurrency(totalIncome)}</span>
          <span className="text-expense">-{formatCurrency(totalExpense)}</span>
        </div>
      </div>
    </div>
  )
}
