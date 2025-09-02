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
      <div className="relative isolate py-16 mb-8">
        <h1 className="relative z-10 px-4 text-5xl sm:text-7xl md:text-8xl sm:px-6 lg:px-8 font-brachial uppercase text-yellow text-center">
          Reading List
        </h1>
      </div>
      <ReadingListPageClient items={items} categories={categories} />
    </div>
  )
}
