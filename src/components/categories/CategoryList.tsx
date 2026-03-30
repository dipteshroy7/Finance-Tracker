import { useState } from 'react'
import type { Category, CategoryType } from '../../types'
import useCategoryStore from '../../store/categoryStore'
import useTransactionStore from '../../store/transactionStore'
import CategoryItem from './CategoryItem'
import CategoryForm from './CategoryForm'
import Modal from '../shared/Modal'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import LoadingSpinner from '../shared/LoadingSpinner'
import Button from '../ui/Button'

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
        <div className="flex rounded-2xl bg-white/5 p-1 gap-1 mb-5">
          {(['expense', 'income'] as CategoryType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 capitalize ${
                activeTab === t
                  ? `${t === 'income' ? 'gradient-income' : 'gradient-expense'} text-white shadow-lg`
                  : 'text-text-muted hover:text-text-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
          size="sm"
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
        <div className="mx-4 mt-4 glass-card overflow-hidden divide-y divide-white/5">
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

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          editingCategory={editingCategory}
          defaultType={activeTab}
          onClose={() => setShowForm(false)}
        />
      </Modal>

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
