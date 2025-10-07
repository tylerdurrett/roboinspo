'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReadingListCard } from '@/components/blog/ReadingListCard'
import { CategoryPills } from '@/components/blog/CategoryPills'
import { ReadingListItemMeta } from '@/models/readingList'
import { Category } from '@/models/category'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  calculatePagination,
  generatePageNumbers,
  generatePaginationUrl,
  shouldShowPagination,
} from '@/lib/pagination'

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
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const pagination = calculatePagination(currentPage, totalItems, pageSize)
  const pageNumbers = generatePageNumbers(
    pagination.currentPage,
    pagination.totalPages
  )

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    const url = generatePaginationUrl(page, params)
    router.push(`/reading${url}`)
  }

  const renderPaginationContent = () => {
    if (!shouldShowPagination(pagination.totalPages)) {
      return null
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={generatePaginationUrl(
                pagination.currentPage - 1,
                searchParams
              )}
              onClick={(e) => {
                e.preventDefault()
                if (pagination.currentPage > 1) {
                  handlePageChange(pagination.currentPage - 1)
                }
              }}
              className={
                pagination.currentPage <= 1
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>

          {pageNumbers.map((item) => (
            <PaginationItem key={item.key}>
              {item.type === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={generatePaginationUrl(item.page!, searchParams)}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(item.page!)
                  }}
                  isActive={item.page === pagination.currentPage}
                >
                  {item.page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={generatePaginationUrl(
                pagination.currentPage + 1,
                searchParams
              )}
              onClick={(e) => {
                e.preventDefault()
                if (pagination.currentPage < pagination.totalPages) {
                  handlePageChange(pagination.currentPage + 1)
                }
              }}
              className={
                pagination.currentPage >= pagination.totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

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
          {renderPaginationContent()}
        </>
      )}
    </div>
  )
}
