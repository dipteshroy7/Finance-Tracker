export const TABS = [
  { path: '/', label: 'Transactions', icon: 'receipt' },
  { path: '/accounts', label: 'Accounts', icon: 'wallet' },
  { path: '/analysis', label: 'Analysis', icon: 'chart' },
  { path: '/import-export', label: 'Import/Export', icon: 'transfer' },
  { path: '/categories', label: 'Categories', icon: 'tag' },
] as const

export const TYPE_MAP_IMPORT: Record<string, 'income' | 'expense' | 'transfer'> = {
  '(+) income': 'income',
  '(+) Income': 'income',
  '(-) expense': 'expense',
  '(-) Expense': 'expense',
  '(*) transfer': 'transfer',
  '(*) Transfer': 'transfer',
}

export const TYPE_MAP_EXPORT: Record<string, string> = {
  income: '(+) Income',
  expense: '(-) Expense',
  transfer: '(*) Transfer',
}

export const TRANSACTION_COLORS = {
  income: 'text-income',
  expense: 'text-expense',
  transfer: 'text-transfer',
} as const

export const TRANSACTION_BG_COLORS = {
  income: 'bg-income/10',
  expense: 'bg-expense/10',
  transfer: 'bg-transfer/10',
} as const
