/**
 * Pagination utility functions for generating page numbers and URLs
 */

export interface PaginationInfo {
  currentPage: number
  totalItems: number
  pageSize: number
  totalPages: number
}

export interface PageNumberGroup {
  type: 'page' | 'ellipsis'
  page?: number
  key: string
}

/**
 * Calculate pagination info from total items and current page
 */
export function calculatePagination(
  currentPage: number,
  totalItems: number,
  pageSize: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    currentPage: Math.max(1, Math.min(currentPage, totalPages)),
    totalItems,
    pageSize,
    totalPages,
  }
}

/**
 * Generate page numbers for pagination UI with ellipses logic
 * Shows: [1] ... [currentPage-1] [currentPage] [currentPage+1] ... [totalPages]
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxDisplayed: number = 7
): PageNumberGroup[] {
  if (totalPages <= maxDisplayed) {
    // Show all pages if total is small
    return Array.from({ length: totalPages }, (_, i) => ({
      type: 'page' as const,
      page: i + 1,
      key: `page-${i + 1}`,
    }))
  }

  const pages: PageNumberGroup[] = []
  const halfDisplayed = Math.floor(maxDisplayed / 2)

  // Always show first page
  if (currentPage > halfDisplayed + 1) {
    pages.push({ type: 'page', page: 1, key: 'page-1' })

    if (currentPage > halfDisplayed + 2) {
      pages.push({ type: 'ellipsis', key: 'ellipsis-start' })
    }
  }

  // Show pages around current page
  const startPage = Math.max(1, currentPage - halfDisplayed)
  const endPage = Math.min(totalPages, currentPage + halfDisplayed)

  for (let i = startPage; i <= endPage; i++) {
    pages.push({ type: 'page', page: i, key: `page-${i}` })
  }

  // Always show last page
  if (currentPage < totalPages - halfDisplayed) {
    if (currentPage < totalPages - halfDisplayed - 1) {
      pages.push({ type: 'ellipsis', key: 'ellipsis-end' })
    }

    pages.push({ type: 'page', page: totalPages, key: `page-${totalPages}` })
  }

  return pages
}

/**
 * Generate a URL with pagination and preserved query parameters
 */
export function generatePaginationUrl(
  page: number,
  currentParams: URLSearchParams = new URLSearchParams()
): string {
  const params = new URLSearchParams(currentParams)

  if (page <= 1) {
    params.delete('page')
  } else {
    params.set('page', page.toString())
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Check if pagination should be shown (more than one page)
 */
export function shouldShowPagination(totalPages: number): boolean {
  return totalPages > 1
}
