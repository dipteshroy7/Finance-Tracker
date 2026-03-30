import useTransactionStore from '../store/transactionStore'

export default function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions)
  const getGroupedByMonth = useTransactionStore((s) => s.getGroupedByMonth)
  return { transactions, getGroupedByMonth }
}
