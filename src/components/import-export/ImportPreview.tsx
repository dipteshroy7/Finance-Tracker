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
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-500 rounded-xl py-3 px-2 text-center shadow-lg">
          <p className="text-xl font-extrabold text-white tabular-nums">{validRows.length}</p>
          <p className="text-[10px] text-white/70 mt-0.5 font-medium">Valid rows</p>
        </div>
        <div className="bg-destructive rounded-xl py-3 px-2 text-center shadow-lg">
          <p className="text-xl font-extrabold text-white tabular-nums">{errors.length}</p>
          <p className="text-[10px] text-white/70 mt-0.5 font-medium">Invalid rows</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl py-3 px-2 text-center shadow-lg">
          <p className="text-xl font-extrabold text-white tabular-nums">{duplicateCount}</p>
          <p className="text-[10px] text-white/70 mt-0.5 font-medium">Duplicates</p>
        </div>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-destructive mb-2">Errors</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {errors.map((err) => (
              <div key={err.row} className="text-xs text-muted-foreground bg-destructive/5 rounded-lg px-3 py-1.5">
                Row {err.row}: {err.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview table */}
      {validRows.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-foreground mb-2">
            Preview (first 10 rows)
          </h4>
          <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Type</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold">Amount</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Category</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Account</th>
                </tr>
              </thead>
              <tbody>
                {validRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-3">
                      <span className={`uppercase font-bold text-[10px] ${
                        row.type === 'income' ? 'text-emerald-500' : row.type === 'expense' ? 'text-destructive' : 'text-blue-400'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-foreground">
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
            <p className="text-xs text-muted-foreground mt-2">...and {validRows.length - 10} more rows</p>
          )}
        </div>
      )}
    </div>
  )
}
