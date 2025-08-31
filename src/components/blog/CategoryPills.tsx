'use client'

import { Button } from '@/components/ui/button'
import { Category } from '@/models/category'

interface CategoryPillsProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categorySlug: string | null) => void
}

export function CategoryPills({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      <Button
        variant={selectedCategory === null ? 'default' : 'ghost'}
        onClick={() => onCategorySelect(null)}
        className="rounded-full"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category._id}
          variant={
            selectedCategory === category.slug.current ? 'default' : 'ghost'
          }
          onClick={() => onCategorySelect(category.slug.current)}
          className="rounded-full"
        >
          {category.title}
        </Button>
      ))}
    </div>
  )
}
