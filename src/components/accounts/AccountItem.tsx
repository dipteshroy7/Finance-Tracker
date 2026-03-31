import type { Account } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { getIconComponent } from '../../utils/categoryIcons'

interface AccountItemProps {
  account: Account
  balance: number
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export default function AccountItem({ account, balance, onEdit, onDelete }: AccountItemProps) {
  const Icon = getIconComponent(account.icon)

  return (
    <div className="group flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground truncate tracking-tight">
            {account.name}
          </p>
          <p className={`text-[13px] font-medium tabular-nums ${balance >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 md:opacity-0 group-hover:opacity-100 transition-all">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(account)}
          className="hover:bg-primary/10 hover:text-primary-light"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(account)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
