import {
  getReadingListItems,
  getReadingListItemsCount,
} from '@/models/readingList'
import { LookingPageClient } from '@/components/blog/LookingPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Looking',
  description: 'A visual collection of featured images from our reading list',
}

type Props = {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function LookingPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const pageSize = 300

  const [items, totalItems] = await Promise.all([
    getReadingListItems({ page, limit: pageSize }),
    getReadingListItemsCount(),
  ])

  return (
    <LookingPageClient
      items={items}
      currentPage={page}
      totalItems={totalItems}
      pageSize={pageSize}
    />
  )
}
