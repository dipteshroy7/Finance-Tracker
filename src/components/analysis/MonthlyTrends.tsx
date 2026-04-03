import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import { formatCurrency, getMonthKey } from '../../utils/formatters'

export default function MonthlyTrends() {
  const transactions = useTransactionStore((s) => s.transactions)

  const data = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()

    for (const tx of transactions) {
      const key = getMonthKey(tx.date)
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 })
      const entry = map.get(key)!
      if (tx.type === 'income') entry.income += Number(tx.amount)
      if (tx.type === 'expense') entry.expense += Number(tx.amount)
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => {
        const [year, month] = key.split('-')
        const date = new Date(Number(year), Number(month) - 1)
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        return { month: label, income: val.income, expense: val.expense }
      })
  }, [transactions])

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Trends</h3>

      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">
          No data available for trends
        </p>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-income" />
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-expense" />
              <span className="text-xs text-muted-foreground">Expense</span>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  dx={-4}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(value),
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
