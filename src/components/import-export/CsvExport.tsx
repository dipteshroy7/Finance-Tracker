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
      <h3 className="text-sm font-bold text-foreground">Export CSV</h3>
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs text-muted-foreground mb-4">
          Export all {transactions.length} transactions to a CSV file.
        </p>
        <Button
          onClick={handleExport}
          disabled={transactions.length === 0}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          Export all to CSV
        </Button>
      </div>
    </div>
  )
}
