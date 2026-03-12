import Link from 'next/link'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ArrowUpIcon, ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SentimentIndicator } from '@/components/blog/SentimentIndicator'

interface ReadingListCardProps {
  item: ReadingListItemMeta
}

export function ReadingListCard({ item }: ReadingListCardProps) {
  const thumbnailUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(120).height(120).url()
    : null
  const mobileImageUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(800).height(400).url()
    : null

  return (
    <article className="bg-card text-card-foreground rounded-3xl border-4 border-transparent hover:border-accent has-[.external-link:hover]:hover:border-accent/60 transition-colors duration-300 relative">
      <Link
        href={`/reading/${item.slug.current}`}
        className="absolute inset-0 z-0 rounded-3xl"
      >
        <span className="sr-only">{item.title}</span>
      </Link>
      {mobileImageUrl && (
        <div className="sm:hidden">
          <Image
            src={mobileImageUrl}
            alt=""
            width={800}
            height={400}
            className="w-full h-48 object-cover rounded-t-[20px]"
          />
        </div>
      )}
      <div className="flex items-start gap-4 p-4 sm:p-6">
        {thumbnailUrl && (
          <div className="flex-shrink-0 hidden sm:block">
            <Image
              src={thumbnailUrl}
              alt={item.title}
              width={120}
              height={120}
              className="w-24 h-24 object-cover rounded-2xl"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {item.categories && item.categories.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              {item.categories.filter(Boolean).map((cat, i) => (
                <span key={cat.slug.current}>
                  {i > 0 && ', '}
                  <Link
                    href={`/reading?category=${cat.slug.current}`}
                    className="relative z-10 hover:underline"
                  >
                    {cat.title}
                  </Link>
                </span>
              ))}
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight break-words">
            {item.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
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
            <SentimentIndicator
              sentimentArticle={item.sentimentArticle ?? null}
              sentimentCommunity={item.sentimentCommunity ?? null}
            />
            {item.hnScore != null && item.hnScore >= 100 && (
              <span
                className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                title={`HN Score: ${item.hnScore}`}
              >
                <ArrowUpIcon className="h-3 w-3" />
                {item.hnScore}
              </span>
            )}
          </div>
          {item.gist && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {item.gist}
            </p>
          )}
          {item.discussionGist && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              <span className="text-muted-foreground/70">Community Says:</span>{' '}
              {item.discussionGist}
            </p>
          )}
          {item.topics && item.topics.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {item.topics.filter(Boolean).map((topic) => (
                <Badge key={topic._id} variant="secondary" asChild>
                  <Link
                    href={`/reading?topic=${topic.slug.current}`}
                    className="relative z-10"
                  >
                    {topic.title}
                  </Link>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
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
