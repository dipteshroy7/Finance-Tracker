import useAccountStore from '../store/accountStore'

export default function useAccounts() {
  return useAccountStore((s) => s.accounts)
}
