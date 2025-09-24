import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { getThingBySlug } from '@/models/thing'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import MuxPlayer from '@mux/mux-player-react'
import { portableTextComponents } from '@/components/portable-text-components'
import { ThingMediaGrid } from '@/components/things/ThingMediaGrid'
import '../../blog/prose.css'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const thing = await getThingBySlug(slug)

  if (!thing) {
    return {
      title: 'Thing Not Found',
    }
  }

  // Generate OpenGraph image URL - use thing's featuredImage or fallback to default
  const ogImageUrl = thing.featuredImage
    ? urlFor(thing.featuredImage).width(1200).height(630).url()
    : '/static/opengraph.jpg'

  return {
    title: thing.title,
    description: thing.description ?? undefined,
    openGraph: {
      title: thing.title,
      description: thing.description ?? undefined,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: thing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: thing.title,
      description: thing.description ?? undefined,
      images: [ogImageUrl],
    },
  }
}

export default async function ThingPage({ params }: Props) {
  const { slug } = params
  const thing = await getThingBySlug(slug)
  const thingImageUrl = thing?.featuredImage
    ? urlFor(thing.featuredImage)?.width(1920).height(1080).url()
    : null

  if (!thing) {
    notFound()
  }

  // Check if the image is a GIF
  const isAnimatedGif = thingImageUrl?.toLowerCase().includes('.gif') || false

  return (
    <div className="py-8 md:py-16">
      <article>
        <Container size="xl">
          <header className="mb-8">
            <h1 className="mb-4 text-5xl md:text-9xl tracking-tight">
              {thing.title}
            </h1>
            {thing?.description && (
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl text-muted-foreground">
                  {thing.description}
                </span>
              </div>
            )}
          </header>
        </Container>

        {thing.featuredVideo?.asset?.playbackId ? (
          <Container size="xl">
            <div className="mb-6 rounded-2xl overflow-hidden">
              <MuxPlayer
                playbackId={thing.featuredVideo.asset.playbackId}
                metadata={{
                  video_id: thing._id,
                  video_title: thing.title,
                }}
                className="aspect-video rounded-xl"
                accentColor="var(--color-yellow)"
                streamType="on-demand"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </Container>
        ) : (
          thingImageUrl && (
            <Container size="xl">
              <div className="mb-6 rounded-2xl overflow-hidden">
                <Image
                  src={thingImageUrl}
                  alt={thing.title}
                  className="aspect-video w-full h-auto object-cover rounded-xl"
                  width={1920}
                  height={1080}
                  unoptimized={isAnimatedGif}
                />
              </div>
              {thing.featuredImage?.caption && (
                <p className="mt-2 italic text-sm text-muted-foreground">
                  {thing.featuredImage.caption}
                </p>
              )}
            </Container>
          )
        )}

        <Container size="md">
          <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-sans prose-headings:font-normal prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-h4:text-xl md:prose-h4:text-2xl">
            {Array.isArray(thing.body) && (
              <PortableText
                value={thing.body}
                components={portableTextComponents}
              />
            )}
          </div>
        </Container>

        {(thing.images && thing.images.length > 0) ||
        (thing.videos && thing.videos.length > 0) ? (
          <Container size="xl">
            <div className="mt-8">
              <ThingMediaGrid images={thing.images} videos={thing.videos} />
            </div>
          </Container>
        ) : null}
      </article>
    </div>
  )
}
