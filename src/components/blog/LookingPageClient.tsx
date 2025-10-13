'use client'

import { useMemo } from 'react'
import { ImageGrid } from '@/components/blog/ImageGrid'
import { ReadingListItemMeta } from '@/models/readingList'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { usePagination } from '@/hooks/usePagination'

interface LookingPageClientProps {
  items: ReadingListItemMeta[]
  currentPage: number
  totalItems: number
  pageSize: number
}

export function LookingPageClient({
  items,
  currentPage,
  totalItems,
  pageSize,
}: LookingPageClientProps) {
  // Filter items that have featured images
  const itemsWithImages = useMemo(
    () => items.filter((item) => item.featuredImage),
    [items]
  )

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
    basePath: '/looking',
  })

  return (
    <div className="w-full">
      {itemsWithImages.length === 0 ? (
        <p className="px-4 text-muted-foreground sm:px-6 lg:px-8">
          No images available yet. Check back soon!
        </p>
      ) : (
        <>
          <ImageGrid items={itemsWithImages} />
          {showPagination && (
            <PaginationControls
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={handlePageChange}
              generateUrl={generateUrl}
              className="mb-8"
            />
          )}
        </>
      )}
    </div>
  )
}
