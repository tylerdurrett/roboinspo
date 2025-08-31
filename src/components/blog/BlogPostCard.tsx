import Link from 'next/link'
import { BlogPostMeta } from '@/models/blog'
import { estimateReadingTime } from '@/lib/text'
import { toPlainText } from 'next-sanity'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'

interface BlogPostCardProps {
  post: BlogPostMeta
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const readingTime = estimateReadingTime(toPlainText(post.body))
  const postImageUrl = post?.mainImage
    ? urlFor(post.mainImage)?.width(550).height(310).url()
    : null
  return (
    <article className="bg-card text-card-foreground rounded-4xl overflow-hidden border-4 border-transparent hover:border-purple-muted transition-colors duration-300 h-full">
      <Link
        href={`/blog/${post.category?.slug.current}/${post.slug.current}`}
        className="group flex h-full flex-col"
      >
        {postImageUrl && (
          <Image
            src={postImageUrl}
            alt={post.title}
            width={550}
            height={310}
            className="w-full h-auto object-cover"
          />
        )}
        <div className="p-4 sm:p-5 flex flex-1 flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow">{post.category?.title}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl">{post.title}</h2>
            {/* <time
              dateTime={post.publishedAt}
              className="shrink-0 text-sm text-muted-foreground"
            >
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time> */}
          </div>
          <p className="text-muted-foreground">{post.excerpt}</p>
          <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <>
                <span>{post.author.name}</span>
                <span>•</span>
              </>
            )}
            <span>{readingTime.text}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
