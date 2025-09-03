import { ReadingListPageClient } from '@/components/blog/ReadingListPageClient'
import { getReadingListItems } from '@/models/readingList'
import { getCategories } from '@/models/category'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reading List',
  description: 'Articles and resources worth sharing',
}

export default async function ReadingListPage() {
  const [items, categories] = await Promise.all([
    getReadingListItems(),
    getCategories(),
  ])

  return (
    <div className="py-16 px-4 sm:px-8 md:px-12">
      <ReadingListPageClient items={items} categories={categories} />
    </div>
  )
}
