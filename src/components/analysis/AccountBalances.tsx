import { useMemo } from 'react'
import useAccountStore from '../../store/accountStore'
import useCategoryStore from '../../store/categoryStore'
import useTransactionStore from '../../store/transactionStore'
import { formatCurrency } from '../../utils/formatters'

export default function AccountBalances() {
  const accounts = useAccountStore((s) => s.accounts)
  const categories = useCategoryStore((s) => s.categories)
  const transactions = useTransactionStore((s) => s.transactions)

  const balances = useMemo(() => {
    const map = new Map<string, number>()

    for (const acc of accounts) {
      map.set(acc.id, 0)
    }

    for (const tx of transactions) {
      const amount = Number(tx.amount)
      if (tx.type === 'income' && tx.account_id) {
        map.set(tx.account_id, (map.get(tx.account_id) ?? 0) + amount)
      } else if (tx.type === 'expense' && tx.account_id) {
        map.set(tx.account_id, (map.get(tx.account_id) ?? 0) - amount)
      } else if (tx.type === 'transfer') {
        if (tx.from_account_id) {
          map.set(tx.from_account_id, (map.get(tx.from_account_id) ?? 0) - amount)
        }
        if (tx.to_account_id) {
          map.set(tx.to_account_id, (map.get(tx.to_account_id) ?? 0) + amount)
        }
      }
    }

    return accounts.map((acc) => ({
      ...acc,
      balance: map.get(acc.id) ?? 0,
    }))
  }, [accounts, transactions])

  if (balances.length === 0) {
    return (
      <div className="px-4">
        <h3 className="text-sm font-bold text-text-dark mb-2">Account Balances</h3>
        <p className="text-xs text-text-muted">No accounts found</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      <h3 className="text-sm font-bold text-text-dark mb-3">Account Balances</h3>
      <div className="glass-card overflow-hidden divide-y divide-white/5">
        {balances.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between py-3.5 px-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary-light flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-sm text-text-dark font-medium truncate">{acc.name}</span>
            </div>
            <span
              className={`text-sm font-bold tabular-nums shrink-0 ml-3 ${
                acc.balance >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              {formatCurrency(acc.balance)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
