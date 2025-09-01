import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import type { Metadata } from 'next'
import { PortableText, toPlainText } from 'next-sanity'
import { getReadingListItemBySlug } from '@/models/readingList'
import Image from 'next/image'
import { estimateReadingTime } from '@/lib/text'
import { urlFor } from '@/sanity/lib/image'
import { portableTextComponents } from '@/components/portable-text-components'
import { ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import '../../blog/prose.css'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getReadingListItemBySlug(slug)

  if (!item) {
    return {
      title: 'Reading List Item Not Found',
    }
  }

  const ogImageUrl = item.featuredImage
    ? urlFor(item.featuredImage).width(1200).height(630).url()
    : '/static/opengraph.jpg'

  return {
    title: item.title,
    description: `Reading list item: ${item.title}`,
    openGraph: {
      title: item.title,
      description: `Reading list item: ${item.title}`,
      type: 'article',
      publishedTime: item.savedAt || undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: `Reading list item: ${item.title}`,
      images: [ogImageUrl],
    },
  }
}

export default async function ReadingListItem({ params }: Props) {
  const { slug } = await params
  const item = await getReadingListItemBySlug(slug)
  const imageUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(1920).height(1080).url()
    : null

  if (!item) {
    notFound()
  }

  const bodyAsText = item.body ? toPlainText(item.body) : ''
  const readingTime = estimateReadingTime(bodyAsText)

  const isAnimatedGif = imageUrl?.toLowerCase().includes('.gif') || false

  return (
    <div className="py-8 md:py-16">
      <article>
        <Container size="xl">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl md:text-2xl font-league-gothic text-yellow">
                {item.category?.title}
              </span>
            </div>
            <h1 className="mb-4 text-5xl md:text-9xl tracking-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <Button
                asChild
                className="bg-yellow text-black hover:bg-yellow/90"
              >
                <a
                  href={item.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Read Original Article
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </header>
        </Container>

        {imageUrl && (
          <Container size="xl">
            <div className="mb-6 rounded-2xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.title}
                className="aspect-video w-full h-auto object-cover rounded-xl"
                width={1920}
                height={1080}
                unoptimized={isAnimatedGif}
              />
            </div>
            {item.featuredImage?.caption && (
              <p className="mt-2 italic text-sm text-muted-foreground">
                {item.featuredImage.caption}
              </p>
            )}
          </Container>
        )}

        <Container size="md">
          <div className="font-league-gothic text-xl bg-muted/30 rounded-xl p-6 mb-8 border border-border/50">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-off-white font-medium">
                  Added on{' '}
                  {item.savedAt
                    ? new Date(item.savedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown date'}
                </span>
              </div>
              {bodyAsText && (
                <>
                  <div className="rounded-full bg-off-white w-2 h-2"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-off-white font-medium">
                      {readingTime.text}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>

        {item.body && Array.isArray(item.body) && item.body.length > 0 && (
          <Container size="md">
            <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-sans prose-headings:font-normal prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-h4:text-xl md:prose-h4:text-2xl">
              <PortableText
                value={item.body}
                components={portableTextComponents}
              />
            </div>
          </Container>
        )}
      </article>
    </div>
  )
}
