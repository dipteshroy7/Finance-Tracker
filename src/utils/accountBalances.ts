import type { Account, Transaction } from '../types'

export function computeAccountBalances(accounts: Account[], transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const acc of accounts) {
    map.set(acc.id, Number(acc.initial_amount) || 0)
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

  return map
}
