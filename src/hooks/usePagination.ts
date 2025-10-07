'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  calculatePagination,
  generatePageNumbers,
  generatePaginationUrl,
  shouldShowPagination,
  type PaginationInfo,
  type PageNumberGroup,
} from '@/lib/pagination'

export interface UsePaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  basePath?: string
}

export interface UsePaginationReturn {
  pagination: PaginationInfo
  pageNumbers: PageNumberGroup[]
  showPagination: boolean
  handlePageChange: (page: number) => void
  generateUrl: (page: number) => string
}

export function usePagination({
  currentPage,
  totalItems,
  pageSize,
  basePath = '',
}: UsePaginationProps): UsePaginationReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pagination = calculatePagination(currentPage, totalItems, pageSize)
  const pageNumbers = generatePageNumbers(
    pagination.currentPage,
    pagination.totalPages
  )
  const showPagination = shouldShowPagination(pagination.totalPages)

  const generateUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString())
    const queryString = generatePaginationUrl(page, params)
    return `${basePath}${queryString}`
  }

  const handlePageChange = (page: number) => {
    const url = generateUrl(page)
    router.push(url)
  }

  return {
    pagination,
    pageNumbers,
    showPagination,
    handlePageChange,
    generateUrl,
  }
}
