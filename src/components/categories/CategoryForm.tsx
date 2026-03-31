import { useState, useEffect } from 'react'
import type { Category, CategoryType } from '../../types'
import useCategoryStore from '../../store/categoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { EXPENSE_ICONS, INCOME_ICONS, getDefaultIconForType } from '../../utils/categoryIcons'

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
  const [icon, setIcon] = useState(getDefaultIconForType(defaultType))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setType(editingCategory.type)
      setIcon(editingCategory.icon ?? getDefaultIconForType(editingCategory.type))
    }
  }, [editingCategory])

  // Update default icon when type changes (only for new categories)
  useEffect(() => {
    if (!editingCategory) {
      setIcon(getDefaultIconForType(type))
    }
  }, [type, editingCategory])

  const icons = type === 'income' ? INCOME_ICONS : EXPENSE_ICONS

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon,
        })
      } else {
        await addCategory(name.trim(), type, icon)
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

      {/* Icon Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Icon
        </label>
        <div className="overflow-x-auto scrollbar-hide rounded-xl bg-secondary/50 border border-white/5 p-2.5">
          <div className="flex gap-2 w-max">
            {Array.from({ length: Math.ceil(icons.length / 2) }, (_, col) => {
              const top = icons[col * 2]
              const bottom = icons[col * 2 + 1]
              return (
                <div key={col} className="flex flex-col gap-2">
                  {[top, bottom].filter(Boolean).map((def) => {
                    const Icon = def.icon
                    const isSelected = icon === def.name
                    return (
                      <button
                        key={def.name}
                        type="button"
                        onClick={() => setIcon(def.name)}
                        className={cn(
                          "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150",
                          isSelected
                            ? type === 'income'
                              ? "bg-emerald-500 text-white shadow-md scale-105"
                              : "bg-destructive text-white shadow-md scale-105"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
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
