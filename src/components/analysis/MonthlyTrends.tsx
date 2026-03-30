import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-bold text-text dark:text-text-dark mb-2">Monthly Trends</h3>
        <p className="text-xs text-text-muted">No data available for trends</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-text-dark mb-3">Monthly Trends</h3>
      <div className="glass-card p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(value),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(15, 17, 32, 0.95)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  backdropFilter: 'blur(12px)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#34d399' }}
                activeDot={{ r: 5, fill: '#34d399', stroke: '#34d399', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#f87171"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f87171' }}
                activeDot={{ r: 5, fill: '#f87171', stroke: '#f87171', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
