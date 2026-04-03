import { Download } from 'lucide-react'
import useTransactionStore from '../../store/transactionStore'
import { exportTransactionsToCSV, downloadCSV } from '../../utils/csvExporter'
import { Button } from '@/components/ui/button'

export default function CsvExport() {
  const transactions = useTransactionStore((s) => s.transactions)

  const handleExport = () => {
    const csv = exportTransactionsToCSV(transactions)
    const date = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `finance-tracker-export-${date}.csv`)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Export CSV</h3>
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground font-medium">
            {transactions.length} transactions
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download all data as CSV
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={transactions.length === 0}
          variant="secondary"
          size="sm"
        >
          <Download size={16} /> Export
        </Button>
      </div>
    </div>
  )
}
