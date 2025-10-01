import type { MuxVideoAsset, ThingQueryResult } from '../../../../sanity.types'

type ThingVideoItem = NonNullable<ThingQueryResult['videos']>[number] & {
  _key?: string
}

type ThingPosterImage = NonNullable<ThingQueryResult['featuredImage']>
type ThingVideoPoster = NonNullable<
  NonNullable<ThingQueryResult['videos']>[number]['poster']
>

export type VideoFeedPosterImage = ThingPosterImage | ThingVideoPoster

export type VideoCreator = {
  id: string
  name: string
  slug?: string | null
  avatarImage?: VideoFeedPosterImage | null
  profileUrl?: string | null
  handle?: string | null
}

export type VideoFeedItem = {
  id: string
  videoKey: string
  thingId: string
  thingSlug: string | null
  thingTitle: string
  shareHref: string
  title: string
  caption: string | null
  description: string | null
  altText: string | null
  posterImage: VideoFeedPosterImage | null
  posterAlt: string | null
  posterUrl: string | null
  muxAssetId: string | null
  muxPlaybackId: string
  muxDuration: number | null
  muxAspectRatio: string | null
  muxPosterFrameTime: number | null
  isFeatured: boolean
  isAiGenerated: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
  creator: VideoCreator | null
}

export type VideoFeedPage = {
  items: VideoFeedItem[]
  nextCursor: string | null
}

const fallbackSlug = (thing: ThingQueryResult): string | null =>
  thing.slug?.current ?? null

const resolveShareHref = (thing: ThingQueryResult): string => {
  const segment = fallbackSlug(thing) ?? thing._id
  return `/thing/${segment}`
}

const extractPosterImage = (
  poster: ThingVideoPoster | null | undefined,
  fallback: ThingPosterImage | null | undefined
): VideoFeedPosterImage | null => {
  if (poster?.asset) {
    return poster
  }

  if (fallback?.asset) {
    return fallback
  }

  return null
}

const extractPosterAlt = (
  video: ThingVideoItem | null | undefined,
  poster: VideoFeedPosterImage | null,
  fallbackTitle: string
): string | null => {
  if (video?.alt) {
    return video.alt
  }

  return poster?.alt ?? fallbackTitle ?? null
}

const extractPlaybackId = (
  asset: MuxVideoAsset | null | undefined
): string | null => {
  if (!asset) {
    return null
  }

  if (asset.playbackId) {
    return asset.playbackId
  }

  const playbackId = asset.data?.playback_ids?.find((id) => !!id.id)?.id
  return playbackId ?? null
}

const extractMuxAssetId = (
  asset: MuxVideoAsset | null | undefined
): string | null => {
  if (!asset) {
    return null
  }

  return asset.assetId ?? asset._id ?? null
}

const extractMuxDuration = (
  asset: MuxVideoAsset | null | undefined
): number | null => {
  const duration = asset?.data?.duration
  return typeof duration === 'number' ? duration : null
}

const extractMuxAspectRatio = (
  asset: MuxVideoAsset | null | undefined
): string | null => asset?.data?.aspect_ratio ?? null

const extractThumbTime = (
  asset: MuxVideoAsset | null | undefined
): number | null => {
  const thumbTime = asset?.thumbTime
  return typeof thumbTime === 'number' ? thumbTime : null
}

const normaliseVideoKey = (
  video: ThingVideoItem | null | undefined,
  fallbackIndex: number
): string => {
  if (video?._key) {
    return video._key
  }

  return `video-${fallbackIndex}`
}

export const mapThingToFeedItems = (
  thing: ThingQueryResult | null | undefined
): VideoFeedItem[] => {
  if (!thing) {
    return []
  }

  const shareHref = resolveShareHref(thing)
  const basePoster = thing.featuredImage ?? null
  const baseTitle = thing.title
  const description = thing.description ?? null
  const isAiGenerated = Boolean(thing.isAiGenerated)
  const items: VideoFeedItem[] = []

  const pushItem = (
    params: Omit<
      VideoFeedItem,
      'thingId' | 'thingSlug' | 'thingTitle' | 'shareHref'
    >
  ) => {
    items.push({
      thingId: thing._id,
      thingSlug: fallbackSlug(thing),
      thingTitle: baseTitle,
      shareHref,
      ...params,
    })
  }

  const featuredAsset = thing.featuredVideo?.asset ?? null
  const featuredPlaybackId = extractPlaybackId(featuredAsset)

  if (featuredPlaybackId) {
    const posterImage = extractPosterImage(null, basePoster)
    const posterAlt = posterImage?.alt ?? baseTitle
    pushItem({
      id: `${thing._id}:featured`,
      videoKey: 'featured',
      title: baseTitle,
      caption: null,
      description,
      altText: posterAlt,
      posterImage,
      posterAlt,
      posterUrl: null,
      muxAssetId: extractMuxAssetId(featuredAsset),
      muxPlaybackId: featuredPlaybackId,
      muxDuration: extractMuxDuration(featuredAsset),
      muxAspectRatio: extractMuxAspectRatio(featuredAsset),
      muxPosterFrameTime: extractThumbTime(featuredAsset),
      isFeatured: true,
      isAiGenerated,
      autoplay: true,
      loop: false,
      muted: true,
      creator: null,
    })
  }

  const videos = thing.videos ?? []

  videos.forEach((rawVideo, index) => {
    const video = rawVideo as ThingVideoItem | null | undefined
    const asset = video?.file?.asset ?? null
    const playbackId = extractPlaybackId(asset)

    if (!playbackId) {
      return
    }

    const posterImage = extractPosterImage(
      (video?.poster ?? null) as ThingVideoPoster | null,
      basePoster
    )
    const videoKey = normaliseVideoKey(video, index)

    const posterAlt = extractPosterAlt(video, posterImage, baseTitle)

    pushItem({
      id: `${thing._id}:${videoKey}`,
      videoKey,
      title: video?.title ?? baseTitle,
      caption: video?.caption ?? null,
      description,
      altText: posterAlt,
      posterImage,
      posterAlt,
      posterUrl: null,
      muxAssetId: extractMuxAssetId(asset),
      muxPlaybackId: playbackId,
      muxDuration: extractMuxDuration(asset),
      muxAspectRatio: extractMuxAspectRatio(asset),
      muxPosterFrameTime: extractThumbTime(asset),
      isFeatured: false,
      isAiGenerated,
      autoplay: video?.autoplay ?? true,
      loop: video?.loop ?? false,
      muted: video?.muted ?? true,
      creator: null,
    })
  })

  return items
}
