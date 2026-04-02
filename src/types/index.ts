export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'

export interface Account {
  id: string
  name: string
  icon: string | null
  initial_amount: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string | null
  created_at: string
}

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  amount: number
  category_id: string | null
  account_id: string | null
  from_account_id: string | null
  to_account_id: string | null
  nos: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  // Joined relations
  category?: Category | null
  account?: Account | null
  from_account?: Account | null
  to_account?: Account | null
}

/** Raw transaction record without joined relations (stored in IndexedDB) */
export type TransactionRecord = Omit<Transaction, 'category' | 'account' | 'from_account' | 'to_account'>

/** Payload for creating/updating a transaction */
export type TransactionPayload = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'category' | 'account' | 'from_account' | 'to_account'>

export interface TransactionFormData {
  type: TransactionType
  amount: number
  category_id: string | null
  account_id: string | null
  from_account_id: string | null
  to_account_id: string | null
  nos: string
  date: string
  time: string
}

export interface MonthGroup {
  key: string
  label: string
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
}

export interface ParsedCSVRow {
  time: string
  type: TransactionType
  amount: number
  category: string
  account: string
  notes: string
  fromAccount?: string
  toAccount?: string
}

export interface CSVValidationResult {
  valid: ParsedCSVRow[]
  errors: { row: number; reason: string }[]
}
