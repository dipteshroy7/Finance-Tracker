import { useMemo } from 'react'
import useCategoryStore from '../store/categoryStore'
import type { CategoryType } from '../types'

export default function useCategories(type?: CategoryType) {
  const categories = useCategoryStore((s) => s.categories)
  const filtered = useMemo(
    () => (type ? categories.filter((c) => c.type === type) : categories),
    [categories, type]
  )
  return filtered
}
