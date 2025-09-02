import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import type { Metadata } from 'next'
import { PortableText, toPlainText } from 'next-sanity'
import { getBlogPostByCategoryAndSlug } from '@/models/blog'
import Image from 'next/image'
import { estimateReadingTime } from '@/lib/text'
import { urlFor } from '@/sanity/lib/image'
import MuxPlayer from '@mux/mux-player-react'
import { portableTextComponents } from '@/components/portable-text-components'
import '../../prose.css'

type Props = {
  params: Promise<{ categorySlug: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, slug } = await params
  const post = await getBlogPostByCategoryAndSlug(categorySlug, slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  // Generate OpenGraph image URL - use post's mainImage or fallback to default
  const ogImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : '/static/opengraph.jpg'

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name ?? ''] : undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const { categorySlug, slug } = await params
  const post = await getBlogPostByCategoryAndSlug(categorySlug, slug)
  const postImageUrl = post?.mainImage
    ? urlFor(post.mainImage)?.width(1920).height(1080).url()
    : null

  if (!post) {
    notFound()
  }
  const bodyAsText = toPlainText(post.body)
  const readingTime = estimateReadingTime(bodyAsText)

  // Check if the image is a GIF
  const isAnimatedGif = postImageUrl?.toLowerCase().includes('.gif') || false

  return (
    <div className="py-8 md:py-16">
      <article>
        <Container size="xl">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl md:text-2xl font-league-gothic text-muted-foreground">
                {post.category?.title}
              </span>
            </div>
            <h1 className="mb-4 text-5xl md:text-9xl tracking-tight">
              {post.title}
            </h1>
            {post?.subtitle && (
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl text-muted-foreground">
                  {post.subtitle}
                </span>
              </div>
            )}
            {post?.intro && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-base text-muted-foreground">
                  {post.intro}
                </span>
              </div>
            )}
          </header>
        </Container>

        {post.mainVideo?.asset?.playbackId ? (
          <Container size="xl">
            <div className="mb-6 rounded-2xl overflow-hidden">
              <MuxPlayer
                playbackId={post.mainVideo.asset.playbackId}
                metadata={{
                  video_id: post._id,
                  video_title: post.title,
                }}
                className="aspect-video rounded-xl"
                accentColor="var(--color-yellow)"
                streamType="on-demand"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </Container>
        ) : (
          postImageUrl &&
          !post.hideMainImageOnPost && (
            <Container size="xl">
              <div className="mb-6 rounded-2xl overflow-hidden">
                <Image
                  src={postImageUrl}
                  alt={post.title}
                  className="aspect-video w-full h-auto object-cover rounded-xl"
                  width={1920}
                  height={1080}
                  unoptimized={isAnimatedGif}
                />
              </div>
              {post.mainImage?.caption && (
                <p className="mt-2 italic text-sm text-muted-foreground">
                  {post.mainImage.caption}
                </p>
              )}
            </Container>
          )
        )}

        <Container size="md">
          <div className="font-league-gothic text-xl bg-muted/30 rounded-xl p-6 mb-8 border border-border/50">
            <div className="flex flex-wrap items-center gap-6">
              {post.author?.name && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      by {post.author.name}
                    </span>
                  </div>
                  <div className="rounded-full bg-off-white w-2 h-2"></div>
                </>
              )}
              <div className="flex items-center gap-2">
                <span className="text-off-white font-medium">
                  {readingTime.text}
                </span>
              </div>
            </div>
          </div>
        </Container>

        <Container size="md">
          <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-sans prose-headings:font-normal prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-h4:text-xl md:prose-h4:text-2xl">
            {Array.isArray(post.body) && (
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            )}
          </div>
        </Container>
      </article>
    </div>
  )
}
