import { formatCurrency } from '../../utils/formatters'

interface MonthGroupProps {
  label: string
  totalIncome: number
  totalExpense: number
}

export default function MonthGroup({ label, totalIncome, totalExpense }: MonthGroupProps) {
  const net = totalIncome - totalExpense

  return (
    <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md px-1 py-3 border-b border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <div className="flex items-center gap-4 text-xs tabular-nums font-medium">
          <span className="text-income">+{formatCurrency(totalIncome)}</span>
          <span className="text-expense">-{formatCurrency(totalExpense)}</span>
          <span className={net >= 0 ? 'text-income' : 'text-expense'}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  )
}
