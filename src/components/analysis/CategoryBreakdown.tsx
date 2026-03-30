import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import { formatCurrency } from '../../utils/formatters'

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6', '#94a3b8', '#2dd4bf']

export default function CategoryBreakdown() {
  const transactions = useTransactionStore((s) => s.transactions)

  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue
      const name = tx.category?.name ?? 'Uncategorized'
      map.set(name, (map.get(name) ?? 0) + Number(tx.amount))
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="px-4">
        <h3 className="text-sm font-bold text-text-dark mb-2">Expense by Category</h3>
        <p className="text-xs text-text-muted">No expense data available</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      <h3 className="text-sm font-bold text-text-dark mb-3">Expense by Category</h3>
      <div className="glass-card p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(15, 17, 32, 0.95)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* List breakdown */}
        <div className="space-y-2.5 mt-4 pt-4 border-t border-white/8">
          {data.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
            return (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-text-dark flex-1 truncate">{item.name}</span>
                <span className="text-[10px] text-text-muted tabular-nums shrink-0">{pct}%</span>
                <span className="text-xs font-semibold text-text-dark tabular-nums shrink-0 ml-1 w-24 text-right">
                  {formatCurrency(item.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
