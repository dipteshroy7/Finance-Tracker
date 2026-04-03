import { CheckCircle2, XCircle, Copy } from 'lucide-react'
import type { ParsedCSVRow } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface ImportPreviewProps {
  validRows: ParsedCSVRow[]
  errors: { row: number; reason: string }[]
  duplicateCount: number
}

export default function ImportPreview({ validRows, errors, duplicateCount }: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-income" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Valid</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">{validRows.length}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <XCircle size={14} className="text-expense" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Errors</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">{errors.length}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Copy size={14} className="text-transfer" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Dupes</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">{duplicateCount}</p>
        </div>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-expense mb-2">Errors</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {errors.map((err) => (
              <div key={err.row} className="text-xs text-muted-foreground bg-expense-subtle rounded-lg px-3 py-1.5">
                Row {err.row}: {err.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview table */}
      {validRows.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-foreground mb-2">
            Preview (first 10 rows)
          </h4>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Account</th>
                </tr>
              </thead>
              <tbody>
                {validRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-b-0">
                    <td className="py-2 px-3">
                      <span className={`uppercase font-semibold text-[10px] ${
                        row.type === 'income' ? 'text-income' : row.type === 'expense' ? 'text-expense' : 'text-transfer'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-foreground tabular-nums">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground truncate max-w-[100px]">{row.category || '-'}</td>
                    <td className="py-2 px-3 text-muted-foreground truncate max-w-[100px]">
                      {row.type === 'transfer'
                        ? `${row.fromAccount} → ${row.toAccount}`
                        : row.account || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {validRows.length > 10 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ...and {validRows.length - 10} more rows
            </p>
          )}
        </div>
      )}
    </div>
  )
}
