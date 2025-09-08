import Link from 'next/link'
import Image from 'next/image'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'

interface ImageGridProps {
  items: ReadingListItemMeta[]
}

export function ImageGrid({ items }: ImageGridProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-px">
      {items.map((item) => {
        const imageUrl = item.featuredImage
          ? urlFor(item.featuredImage)?.width(800).url()
          : null

        if (!imageUrl) return null

        return (
          <Link
            key={item._id}
            href={`/reading/${item.slug.current}`}
            className="block mb-px break-inside-avoid hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src={imageUrl}
              alt={item.title}
              width={800}
              height={0}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="w-full h-auto"
            />
          </Link>
        )
      })}
    </div>
  )
}
