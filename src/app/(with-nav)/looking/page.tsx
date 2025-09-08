import { getReadingListItems } from '@/models/readingList'
import { ImageGrid } from '@/components/blog/ImageGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Looking',
  description: 'A visual collection of featured images from our reading list',
}

export default async function LookingPage() {
  const items = await getReadingListItems()

  // Filter items that have featured images
  const itemsWithImages = items.filter((item) => item.featuredImage)

  return (
    <div className="w-full">
      <ImageGrid items={itemsWithImages} />
    </div>
  )
}
