import { useState } from 'react'
import { Plus, Tags } from 'lucide-react'
import type { Category, CategoryType } from '../../types'
import useCategoryStore from '../../store/categoryStore'
import useTransactionStore from '../../store/transactionStore'
import CategoryItem from './CategoryItem'
import CategoryForm from './CategoryForm'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function CategoryList() {
  const categories = useCategoryStore((s) => s.categories)
  const loading = useCategoryStore((s) => s.loading)
  const deleteCategory = useCategoryStore((s) => s.deleteCategory)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)

  const [activeTab, setActiveTab] = useState<CategoryType>('expense')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const filtered = categories.filter((c) => c.type === activeTab)

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
          <TabsList className="h-9 p-1">
            <TabsTrigger
              value="expense"
              className={cn(
                'text-sm font-medium px-4',
                activeTab === 'expense' && '!bg-expense/10 !text-expense',
              )}
            >
              Expense
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn(
                'text-sm font-medium px-4',
                activeTab === 'income' && '!bg-income/10 !text-income',
              )}
            >
              Income
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
          size="sm"
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} categories`}
          description={`Add a category to start tracking ${activeTab}s`}
          icon={Tags}
        />
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-border">
          {filtered.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              onEdit={(c) => {
                setEditingCategory(c)
                setShowForm(true)
              }}
              onDelete={(c) => setDeletingCategory(c)}
            />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border bg-card">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingCategory ? 'Edit an existing category' : 'Create a new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-hidden">
            <CategoryForm
              editingCategory={editingCategory}
              defaultType={activeTab}
              onClose={() => setShowForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory(deletingCategory.id)
            fetchTransactions()
          }
        }}
        title="Delete Category"
        message={`Deleting "${deletingCategory?.name}" will delete all related transactions. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </>
  )
}
