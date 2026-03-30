import Papa from 'papaparse'
import type { Transaction } from '../types'
import { TYPE_MAP_EXPORT } from './constants'

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const rows = transactions.map((tx) => {
    const typeLabel = TYPE_MAP_EXPORT[tx.type] ?? '(-) Expense'

    let account = ''
    if (tx.type === 'transfer') {
      const from = tx.from_account?.name ?? ''
      const to = tx.to_account?.name ?? ''
      account = `${from}->${to}`
    } else {
      account = tx.account?.name ?? ''
    }

    const category = tx.type === 'transfer' ? '-' : (tx.category?.name ?? '')
    const date = new Date(tx.date)
    // Format: "Sep 01, 2024 12:30 PM"
    const timeStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return [timeStr, typeLabel, String(tx.amount), category, account, tx.nos]
  })

  return Papa.unparse({
    fields: ['TIME', 'TYPE', 'AMOUNT', 'CATEGORY', 'ACCOUNT', 'NOTES'],
    data: rows,
  }, {
    delimiter: '\t',
  })
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
