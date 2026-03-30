import { useState, useEffect } from 'react'
import type { Category, CategoryType } from '../../types'
import useCategoryStore from '../../store/categoryStore'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface CategoryFormProps {
  editingCategory: Category | null
  defaultType: CategoryType
  onClose: () => void
}

export default function CategoryForm({ editingCategory, defaultType, onClose }: CategoryFormProps) {
  const addCategory = useCategoryStore((s) => s.addCategory)
  const updateCategory = useCategoryStore((s) => s.updateCategory)

  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>(defaultType)
  const [initialAmount, setInitialAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setType(editingCategory.type)
      setInitialAmount(Number(editingCategory.initial_amount))
    }
  }, [editingCategory])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          initial_amount: initialAmount,
        })
      } else {
        await addCategory(name.trim(), type, initialAmount)
      }
      onClose()
    } catch (err) {
      console.error('Failed to save category:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-5 pb-8 space-y-5">
      <Input
        label="Category Name"
        id="cat-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Food, Salary"
        autoFocus
      />

      {!editingCategory && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Type</label>
          <div className="flex rounded-2xl bg-gray-100 dark:bg-white/5 p-1 gap-1">
            {(['expense', 'income'] as CategoryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 capitalize ${
                  type === t
                    ? `${t === 'income' ? 'gradient-income' : 'gradient-expense'} text-white shadow-lg`
                    : 'text-text-muted hover:text-text dark:hover:text-text-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Initial Amount"
        id="initial-amount"
        type="number"
        value={initialAmount || ''}
        onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
        placeholder="0.00"
        min={0}
        step={0.01}
      />

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="flex-1"
        >
          {saving ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
        </Button>
      </div>
    </div>
  )
}
