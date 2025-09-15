import Link from 'next/link'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ExternalLinkIcon } from 'lucide-react'

interface ReadingListCardProps {
  item: ReadingListItemMeta
}

export function ReadingListCard({ item }: ReadingListCardProps) {
  const imageUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(120).height(120).url()
    : null

  return (
    <article className="bg-card text-card-foreground rounded-3xl border-4 border-transparent hover:border-accent has-[.external-link:hover]:hover:border-accent/60 transition-colors duration-300 relative">
      <Link
        href={`/reading/${item.slug.current}`}
        className="group flex items-start gap-4 p-4 sm:p-6"
      >
        {imageUrl && (
          <div className="flex-shrink-0">
            <Image
              src={imageUrl}
              alt={item.title}
              width={120}
              height={120}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              {item.category?.title}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
            {item.title}
          </h2>
          {item.savedAt && (
            <time
              dateTime={item.savedAt}
              className="text-sm text-muted-foreground"
            >
              {new Date(item.savedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
      </Link>
      {item.originalUrl && (
        <Link
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 rounded-full bg-background/80 hover:bg-background z-10 hover:scale-110 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </Link>
      )}
    </article>
  )
}
