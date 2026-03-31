import Papa from 'papaparse'
import type { ParsedCSVRow, CSVValidationResult, TransactionType } from '../types'
import { TYPE_MAP_IMPORT } from './constants'

export function parseCSV(content: string): string[][] {
  // Auto-detect delimiter: use tab if present, otherwise let PapaParse detect
  const firstLine = content.split('\n')[0] ?? ''
  const delimiter = firstLine.includes('\t') ? '\t' : undefined

  const result = Papa.parse<string[]>(content, {
    header: false,
    skipEmptyLines: true,
    ...(delimiter ? { delimiter } : {}),
  })
  return result.data
}

function parseTypeField(raw: string): 'income' | 'expense' | 'transfer' | null {
  const trimmed = raw.trim()
  // Direct match from map
  const mapped = TYPE_MAP_IMPORT[trimmed]
  if (mapped) return mapped

  // Fallback: extract symbol from parentheses like (+), (-), (*)
  const match = trimmed.match(/^\(([+\-*])\)/)
  if (match) {
    const sym = match[1]
    if (sym === '+') return 'income'
    if (sym === '-') return 'expense'
    if (sym === '*') return 'transfer'
  }

  return null
}

export function validateRows(rows: string[][]): CSVValidationResult {
  const valid: ParsedCSVRow[] = []
  const errors: { row: number; reason: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    // Skip header-like rows
    if (i === 0 && row[0]?.toUpperCase().includes('TIME')) continue

    if (row.length < 4) {
      errors.push({ row: i + 1, reason: 'Too few columns' })
      continue
    }

    const [time, typeRaw, amountStr, category, account, notes] = row.map((s) => s?.trim() ?? '')

    // Validate time
    if (!time) {
      errors.push({ row: i + 1, reason: 'Missing time' })
      continue
    }

    const parsedDate = new Date(time)
    if (isNaN(parsedDate.getTime())) {
      errors.push({ row: i + 1, reason: `Invalid date: ${time}` })
      continue
    }

    // Validate type
    const type = parseTypeField(typeRaw)
    if (!type) {
      errors.push({ row: i + 1, reason: `Invalid type: ${typeRaw}` })
      continue
    }

    // Validate amount
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      errors.push({ row: i + 1, reason: `Invalid amount: ${amountStr}` })
      continue
    }

    // Clean category — "-" means no category (used for transfers)
    const cleanCategory = category === '-' ? '' : category

    const parsed: ParsedCSVRow = {
      time: parsedDate.toISOString(),
      type,
      amount,
      category: cleanCategory,
      account: account ?? '',
      notes: notes ?? '',
    }

    // Handle transfer account splitting
    if (type === 'transfer' && account.includes('->')) {
      const parts = account.split('->')
      parsed.fromAccount = parts[0].trim()
      parsed.toAccount = parts[1].trim()
    }

    valid.push(parsed)
  }

  return { valid, errors }
}

export interface ResolvedRow {
  date: string
  type: TransactionType
  amount: number
  category_id: string | null
  account_id: string | null
  from_account_id: string | null
  to_account_id: string | null
  nos: string
}

export async function resolveEntities(
  rows: ParsedCSVRow[],
  getOrCreateAccount: (name: string) => Promise<{ id: string }>,
  getOrCreateCategory: (name: string, type: 'income' | 'expense') => Promise<{ id: string }>
): Promise<ResolvedRow[]> {
  // Pre-resolve all unique accounts and categories to avoid redundant API calls
  const accountCache = new Map<string, string>()
  const categoryCache = new Map<string, string>()

  const uniqueAccounts = new Set<string>()
  const uniqueCategories = new Set<string>() // "name|type"

  for (const row of rows) {
    if (row.type === 'transfer') {
      if (row.fromAccount) uniqueAccounts.add(row.fromAccount)
      if (row.toAccount) uniqueAccounts.add(row.toAccount)
    } else {
      if (row.account) uniqueAccounts.add(row.account)
      if (row.category) uniqueCategories.add(`${row.category}|${row.type}`)
    }
  }

  // Resolve all unique accounts in parallel
  await Promise.all(
    Array.from(uniqueAccounts).map(async (name) => {
      const acc = await getOrCreateAccount(name)
      accountCache.set(name, acc.id)
    })
  )

  // Resolve all unique categories in parallel
  await Promise.all(
    Array.from(uniqueCategories).map(async (key) => {
      const [name, type] = key.split('|')
      const cat = await getOrCreateCategory(name, type as 'income' | 'expense')
      categoryCache.set(key, cat.id)
    })
  )

  return rows.map((row) => {
    let account_id: string | null = null
    let from_account_id: string | null = null
    let to_account_id: string | null = null
    let category_id: string | null = null

    if (row.type === 'transfer') {
      if (row.fromAccount) from_account_id = accountCache.get(row.fromAccount) ?? null
      if (row.toAccount) to_account_id = accountCache.get(row.toAccount) ?? null
    } else {
      if (row.account) account_id = accountCache.get(row.account) ?? null
      if (row.category) category_id = categoryCache.get(`${row.category}|${row.type}`) ?? null
    }

    return {
      date: row.time,
      type: row.type,
      amount: row.amount,
      category_id,
      account_id,
      from_account_id,
      to_account_id,
      nos: row.notes,
    }
  })
}

export function deduplicateRows(
  rows: ResolvedRow[],
  existingTransactions: { date: string; amount: number; nos: string }[]
): ResolvedRow[] {
  const existingKeys = new Set(
    existingTransactions.map(
      (t) => `${new Date(t.date).getTime()}_${Number(t.amount)}_${t.nos}`
    )
  )

  return rows.filter((row) => {
    const key = `${new Date(row.date).getTime()}_${row.amount}_${row.nos}`
    return !existingKeys.has(key)
  })
}
