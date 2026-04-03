import { useState, useRef } from 'react'
import { Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
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

      const existingKeys = new Set(
        transactions.map(
          (t) => `${new Date(t.date).getTime()}_${Number(t.amount)}_${t.nos}`,
        ),
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
        getOrCreateCategory,
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

  // Step indicator
  const steps = ['Upload', 'Preview', 'Import']
  const stepIndex = step === 'upload' ? 0 : step === 'preview' ? 1 : 2

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Import CSV</h3>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                  i <= stepIndex
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < stepIndex ? (
                  <CheckCircle2 size={14} />
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 'upload' && (
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center mx-auto mb-4">
            <Upload size={22} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select a CSV or TSV file to import
          </p>
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
          <p className="text-[10px] text-muted-foreground mt-4">
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
            <div className="glass-card border-destructive/30 px-4 py-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Import failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{importError}</p>
              </div>
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
              Import {validRows.length - duplicateCount} new{' '}
              {validRows.length - duplicateCount === 1 ? 'row' : 'rows'}
            </Button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="glass-card p-10 text-center">
          <Loader2 size={24} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Importing transactions...</p>
        </div>
      )}

      {step === 'done' && importResult && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-income text-white flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Import complete</p>
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
