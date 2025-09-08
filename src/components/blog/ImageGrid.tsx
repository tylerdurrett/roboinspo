import Link from 'next/link'
import Image from 'next/image'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'

interface ImageGridProps {
  items: ReadingListItemMeta[]
}

export function ImageGrid({ items }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-px">
      {items.map((item) => {
        const imageUrl = item.featuredImage
          ? urlFor(item.featuredImage)?.width(400).height(400).url()
          : null

        if (!imageUrl) return null

        return (
          <Link
            key={item._id}
            href={`/reading/${item.slug.current}`}
            className="aspect-square block overflow-hidden hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src={imageUrl}
              alt={item.title}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </Link>
        )
      })}
    </div>
  )
}
