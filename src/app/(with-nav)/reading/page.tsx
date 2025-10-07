import { ReadingListPageClient } from '@/components/blog/ReadingListPageClient'
import {
  getReadingListItems,
  getReadingListItemsCount,
} from '@/models/readingList'
import { getCategories } from '@/models/category'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reading List',
  description: 'Articles and resources worth sharing',
}

type Props = {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function ReadingListPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const pageSize = 100

  const [items, categories, totalItems] = await Promise.all([
    getReadingListItems({ page, limit: pageSize }),
    getCategories(),
    getReadingListItemsCount(),
  ])

  return (
    <div className="py-16 px-4 sm:px-8 md:px-12">
      <ReadingListPageClient
        items={items}
        categories={categories}
        currentPage={page}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  )
}
