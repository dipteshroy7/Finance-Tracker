import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import { formatCurrency } from '../../utils/formatters'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4',
  '#6366f1', '#a855f6', '#ec4899', '#64748b', '#14b8a6',
]

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

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Expense by Category</h3>

      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">
          No expense data available
        </p>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown list */}
          <div className="space-y-2 mt-4 pt-4 border-t border-border">
            {data.map((item, i) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {pct}%
                  </span>
                  <span className="text-sm font-medium text-foreground tabular-nums shrink-0 w-24 text-right">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
