import { useState, useEffect } from 'react'
import type { Category, CategoryType } from '../../types'
import useCategoryStore from '../../store/categoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Category Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Food, Salary"
          className="h-11 rounded-xl bg-secondary border-0 px-4"
          autoFocus
        />
      </div>

      {!editingCategory && (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
            Type
          </label>
          <Tabs value={type} onValueChange={(v) => setType(v as CategoryType)}>
            <TabsList className="w-full h-11 p-1">
              <TabsTrigger
                value="expense"
                className={cn(
                  "flex-1 h-full text-sm font-medium",
                  type === 'expense' && "!bg-destructive !text-white shadow-sm"
                )}
              >
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className={cn(
                  "flex-1 h-full text-sm font-medium",
                  type === 'income' && "!bg-emerald-500 !text-white shadow-sm"
                )}
              >
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Initial Amount
        </label>
        <Input
          type="number"
          value={initialAmount || ''}
          onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="h-11 rounded-xl bg-secondary border-0 px-4"
          min={0}
          step={0.01}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="flex-1 rounded-xl h-11"
        >
          {saving ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
        </Button>
      </div>
    </div>
  )
}
