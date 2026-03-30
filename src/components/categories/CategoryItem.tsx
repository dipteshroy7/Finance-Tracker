import type { Category } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface CategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-3 h-3 rounded-full shrink-0 ${
            category.type === 'income' ? 'bg-income' : 'bg-expense'
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text dark:text-text-dark truncate">
            {category.name}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Initial: {formatCurrency(Number(category.initial_amount))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-xl hover:bg-white/10 text-text-muted transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(category)}
          className="p-2 rounded-xl hover:bg-expense/10 text-text-muted hover:text-expense transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
