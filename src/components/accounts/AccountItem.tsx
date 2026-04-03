import type { Account } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { getIconComponent } from '../../utils/categoryIcons'

interface AccountItemProps {
  account: Account
  balance: number
  onSelect: (account: Account) => void
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export default function AccountItem({ account, balance, onSelect, onEdit, onDelete }: AccountItemProps) {
  const Icon = getIconComponent(account.icon)

  return (
    <div
      className="group flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors duration-150 cursor-pointer"
      onClick={() => onSelect(account)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {account.name}
          </p>
          <p className={`text-xs font-medium tabular-nums ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onEdit(account) }}
          className="hover:bg-primary/10 hover:text-primary cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(account) }}
          className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
