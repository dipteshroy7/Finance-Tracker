import { useState, useRef } from 'react'
import { parseCSV, validateRows, resolveEntities, deduplicateRows } from '../../utils/csvParser'
import type { ParsedCSVRow } from '../../types'
import useAccountStore from '../../store/accountStore'
import useCategoryStore from '../../store/categoryStore'
import useTransactionStore from '../../store/transactionStore'
import ImportPreview from './ImportPreview'
import { Button } from '@/components/ui/button'

export default function CsvImport() {
  const getOrCreateAccount = useAccountStore((s) => s.getOrCreateAccount)
  const getOrCreateCategory = useCategoryStore((s) => s.getOrCreateCategory)
  const bulkInsert = useTransactionStore((s) => s.bulkInsertTransactions)
  const transactions = useTransactionStore((s) => s.transactions)

  const fileRef = useRef<HTMLInputElement>(null)
  const [validRows, setValidRows] = useState<ParsedCSVRow[]>([])
  const [errors, setErrors] = useState<{ row: number; reason: string }[]>([])
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const rows = parseCSV(content)
      const result = validateRows(rows)

      // Compute preview duplicate count against existing transactions
      const existingKeys = new Set(
        transactions.map(
          (t) => `${new Date(t.date).getTime()}_${Number(t.amount)}_${t.nos}`
        )
      )
      let previewDups = 0
      for (const row of result.valid) {
        const key = `${new Date(row.time).getTime()}_${row.amount}_${row.notes}`
        if (existingKeys.has(key)) previewDups++
      }

      setValidRows(result.valid)
      setErrors(result.errors)
      setDuplicateCount(previewDups)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setStep('importing')
    setImportError(null)
    try {
      const resolved = await resolveEntities(
        validRows,
        getOrCreateAccount,
        getOrCreateCategory
      )

      const deduped = deduplicateRows(resolved, transactions)
      const dupCount = resolved.length - deduped.length
      setDuplicateCount(dupCount)

      if (deduped.length > 0) {
        const inserted = await bulkInsert(deduped)
        setImportResult({ imported: inserted.length })
      } else {
        setImportResult({ imported: 0 })
      }
      setStep('done')
    } catch (err: any) {
      console.error('Import failed:', err)
      const message = err?.message || err?.error_description || String(err)
      setImportError(message)
      setStep('preview')
    }
  }

  const handleReset = () => {
    setValidRows([])
    setErrors([])
    setDuplicateCount(0)
    setStep('upload')
    setImportResult(null)
    setImportError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">Import CSV</h3>

      {step === 'upload' && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/30">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Select a CSV or TSV file to import</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileRef.current?.click()} size="sm">
            Choose File
          </Button>
          <p className="text-[10px] text-muted-foreground/60 mt-4">
            Tab-separated: TIME, TYPE, AMOUNT, CATEGORY, ACCOUNT, NOTES
          </p>
        </div>
      )}

      {step === 'preview' && (
        <>
          <ImportPreview
            validRows={validRows}
            errors={errors}
            duplicateCount={duplicateCount}
          />
          {importError && (
            <div className="rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive bg-destructive/5">
              <p className="font-semibold">Import failed</p>
              <p className="text-xs mt-1 opacity-70">{importError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={validRows.length === 0 || validRows.length - duplicateCount <= 0}
              className="flex-1"
            >
              Import {validRows.length - duplicateCount} new {validRows.length - duplicateCount === 1 ? 'row' : 'rows'}
            </Button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Importing transactions...</p>
        </div>
      )}

      {step === 'done' && importResult && (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Import complete!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {importResult.imported} transactions imported
              {duplicateCount > 0 && `, ${duplicateCount} duplicates skipped`}
            </p>
          </div>
          <Button onClick={handleReset} variant="secondary" size="sm">
            Import another file
          </Button>
        </div>
      )}
    </div>
  )
}
