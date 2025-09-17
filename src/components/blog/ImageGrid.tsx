import Link from 'next/link'
import Image from 'next/image'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'

interface ImageGridProps {
  items: ReadingListItemMeta[]
}

export function ImageGrid({ items }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
      {items.map((item) => {
        const imageUrl = item.featuredImage
          ? urlFor(item.featuredImage)?.width(800).url()
          : null

        if (!imageUrl) return null

        return (
          <Link
            key={item._id}
            href={`/reading/${item.slug.current}`}
            className="block hover:opacity-80 transition-opacity duration-200"
          >
            <div className="aspect-video overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.title}
                width={800}
                height={450}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
