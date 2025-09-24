import Image from 'next/image'
import MuxPlayer from '@mux/mux-player-react'
import { urlFor } from '@/sanity/lib/image'
import type { ThingQueryResult } from '../../../sanity.types'

type ImageItem = NonNullable<NonNullable<ThingQueryResult>['images']>[number]
type VideoItem = NonNullable<NonNullable<ThingQueryResult>['videos']>[number]

type ImageMediaItem = {
  type: 'image'
  id: string
  data: ImageItem
}

type VideoMediaItem = {
  type: 'video'
  id: string
  data: VideoItem
}

type MediaItem = ImageMediaItem | VideoMediaItem

interface ThingMediaGridProps {
  images?: NonNullable<ThingQueryResult>['images']
  videos?: NonNullable<ThingQueryResult>['videos']
}

export function ThingMediaGrid({ images, videos }: ThingMediaGridProps) {
  const mediaItems: MediaItem[] = []

  if (images) {
    images.forEach((image: ImageItem) => {
      if (image.asset) {
        mediaItems.push({
          type: 'image',
          id: image._key,
          data: image,
        })
      }
    })
  }

  if (videos) {
    videos.forEach((video: VideoItem, index: number) => {
      if (video.file?.asset?.playbackId) {
        mediaItems.push({
          type: 'video',
          id: video.file.asset._id || `video-${index}`,
          data: video,
        })
      }
    })
  }

  if (mediaItems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      {mediaItems.map((item) => {
        if (item.type === 'image') {
          const imageUrl = urlFor(item.data)?.width(800).url()
          if (!imageUrl) return null

          const isAnimatedGif = imageUrl.toLowerCase().includes('.gif')

          return (
            <div
              key={item.id}
              className="aspect-video overflow-hidden rounded-lg"
            >
              <Image
                src={imageUrl}
                alt={item.data.alt || ''}
                width={800}
                height={450}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
                unoptimized={isAnimatedGif}
              />
            </div>
          )
        }

        if (item.type === 'video' && item.data.file.asset) {
          const posterUrl = item.data.poster?.asset
            ? urlFor(item.data.poster)?.width(800).url()
            : undefined

          return (
            <div
              key={item.id}
              className="aspect-video overflow-hidden rounded-lg"
            >
              <MuxPlayer
                playbackId={item.data.file.asset.playbackId}
                metadata={{
                  video_id: item.data.file.asset._id,
                  video_title: item.data.title || '',
                }}
                className="w-full h-full"
                poster={posterUrl}
                accentColor="var(--color-yellow)"
                streamType="on-demand"
                autoPlay={item.data.autoplay || false}
                loop={item.data.loop || false}
                muted={item.data.muted || false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
