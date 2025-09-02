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
    ? urlFor(item.featuredImage)?.width(550).height(310).url()
    : null

  return (
    <article className="bg-card text-card-foreground rounded-4xl overflow-hidden border-4 border-transparent hover:border-purple-muted has-[.external-link:hover]:hover:border-purple-muted/60 transition-colors duration-300 h-full relative">
      <Link
        href={`/reading/${item.slug.current}`}
        className="group flex h-full flex-col"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={item.title}
            width={550}
            height={310}
            className="w-full h-auto object-cover"
          />
        )}
        <div className="p-4 sm:p-5 flex flex-1 flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow">{item.category?.title}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl">{item.title}</h2>
          </div>
          <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
            {item.savedAt && (
              <time dateTime={item.savedAt}>
                {new Date(item.savedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        </div>
      </Link>
      {item.originalUrl && (
        <Link
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link absolute bottom-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background z-10 hover:scale-120 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </Link>
      )}
    </article>
  )
}
