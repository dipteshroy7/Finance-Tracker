import type { Category } from '../../types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { getIconComponent } from '../../utils/categoryIcons'

interface CategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const Icon = getIconComponent(category.icon)
  const iconBg = category.type === 'income'
    ? 'bg-income-subtle text-income'
    : 'bg-expense-subtle text-expense'

  return (
    <div className="group flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {category.name}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(category)}
          className="hover:bg-primary/10 hover:text-primary cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(category)}
          className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
