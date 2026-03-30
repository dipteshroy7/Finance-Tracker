import type { Category } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface CategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  return (
    <div className="group flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-3 h-3 rounded-full shrink-0 ${
            category.type === 'income' ? 'bg-emerald-500' : 'bg-destructive'
          }`}
        />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground truncate tracking-tight">
            {category.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              Initial Balance
            </span>
            <span className="text-[13px] font-medium text-muted-foreground tabular-nums">
              {formatCurrency(Number(category.initial_amount))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 md:opacity-0 group-hover:opacity-100 transition-all">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(category)}
          className="hover:bg-primary/10 hover:text-primary-light"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(category)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
