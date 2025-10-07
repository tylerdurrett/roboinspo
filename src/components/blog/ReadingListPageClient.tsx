'use client'

import { useState, useMemo } from 'react'
import { ReadingListCard } from '@/components/blog/ReadingListCard'
import { CategoryPills } from '@/components/blog/CategoryPills'
import { ReadingListItemMeta } from '@/models/readingList'
import { Category } from '@/models/category'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { usePagination } from '@/hooks/usePagination'

interface ReadingListPageClientProps {
  items: ReadingListItemMeta[]
  categories: Category[]
  currentPage: number
  totalItems: number
  pageSize: number
}

export function ReadingListPageClient({
  items,
  categories,
  currentPage,
  totalItems,
  pageSize,
}: ReadingListPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    if (!selectedCategory) {
      return items
    }
    return items.filter((item) =>
      item.categories?.some(
        (category) => category.slug.current === selectedCategory
      )
    )
  }, [items, selectedCategory])

  const {
    pagination,
    pageNumbers,
    showPagination,
    handlePageChange,
    generateUrl,
  } = usePagination({
    currentPage,
    totalItems,
    pageSize,
    basePath: '/reading',
  })

  return (
    <div className="relative">
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      {filteredItems.length === 0 ? (
        <p className="px-4 text-muted-foreground sm:px-6 lg:px-8">
          {selectedCategory
            ? 'No reading list items in this category yet.'
            : 'No reading list items yet. Check back soon!'}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {filteredItems.map((item) => (
              <ReadingListCard key={item._id} item={item} />
            ))}
          </div>
          {showPagination && (
            <PaginationControls
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={handlePageChange}
              generateUrl={generateUrl}
            />
          )}
        </>
      )}
    </div>
  )
}
