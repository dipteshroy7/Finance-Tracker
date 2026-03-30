import { useState } from 'react'
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
      <div className="px-4 pt-5">
        {/* Tab toggle */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
          <TabsList className="w-full h-11 p-1 mb-5">
            <TabsTrigger
              value="expense"
              className={cn(
                "flex-1 h-full text-sm font-medium capitalize",
                activeTab === 'expense' && "!bg-destructive !text-white shadow-sm"
              )}
            >
              Expense
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn(
                "flex-1 h-full text-sm font-medium capitalize",
                activeTab === 'income' && "!bg-emerald-500 !text-white shadow-sm"
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
          className="w-full"
        >
          + Add {activeTab} category
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} categories`}
          description={`Add a category to start tracking ${activeTab}s`}
        />
      ) : (
        <div className="mx-4 md:mx-0 mt-4 rounded-2xl glass-card overflow-hidden divide-y divide-white/5 border border-white/5 shadow-xl shadow-black/20 mb-8">
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
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-white/10 glass-card">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingCategory ? 'Edit an existing category' : 'Create a new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
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
