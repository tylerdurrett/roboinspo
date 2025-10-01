import { getThings } from '@/models/thing'
import { ThingImageGrid } from '@/components/things/ThingImageGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Things',
  description: 'A visual collection of featured images from our things',
}

export default async function ThingsPage() {
  const items = await getThings()

  // Filter items that have featured images
  const itemsWithImages = items.filter((item) => item.featuredImage)

  return (
    <div className="w-full">
      <ThingImageGrid items={itemsWithImages} />
    </div>
  )
}
