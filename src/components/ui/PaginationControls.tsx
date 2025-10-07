import { type MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { type PaginationInfo, type PageNumberGroup } from '@/lib/pagination'

interface PaginationControlsProps {
  pagination: PaginationInfo
  pageNumbers: PageNumberGroup[]
  onPageChange: (page: number) => void
  generateUrl: (page: number) => string
  className?: string
}

export function PaginationControls({
  pagination,
  pageNumbers,
  onPageChange,
  generateUrl,
  className,
}: PaginationControlsProps) {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    onPageChange(page)
  }

  return (
    <Pagination className={cn('mt-8', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={generateUrl(pagination.currentPage - 1)}
            onClick={(e) => {
              e.preventDefault()
              if (pagination.currentPage > 1) {
                onPageChange(pagination.currentPage - 1)
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
                href={generateUrl(item.page!)}
                onClick={(e) => handleLinkClick(e, item.page!)}
                isActive={item.page === pagination.currentPage}
              >
                {item.page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={generateUrl(pagination.currentPage + 1)}
            onClick={(e) => {
              e.preventDefault()
              if (pagination.currentPage < pagination.totalPages) {
                onPageChange(pagination.currentPage + 1)
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
