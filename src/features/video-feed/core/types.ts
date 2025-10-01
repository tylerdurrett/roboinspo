import type { MuxVideoAsset, ThingQueryResult } from '../../../../sanity.types'

type ThingFeaturedImage = NonNullable<ThingQueryResult['featuredImage']>

export type VideoFeedPosterImage = ThingFeaturedImage

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
  videoKey: 'featured'
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

const getFeaturedPosterImage = (
  thing: ThingQueryResult
): VideoFeedPosterImage | null => {
  const image = thing.featuredImage

  if (image?.asset) {
    return image
  }

  return null
}

const getFeaturedPosterAlt = (
  thing: ThingQueryResult,
  poster: VideoFeedPosterImage | null
): string | null => {
  if (poster?.alt) {
    return poster.alt
  }

  return thing.title
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

export const mapThingToFeedItems = (
  thing: ThingQueryResult | null | undefined
): VideoFeedItem[] => {
  if (!thing) {
    return []
  }

  const featuredAsset = thing.featuredVideo?.asset ?? null
  const playbackId = extractPlaybackId(featuredAsset)

  if (!playbackId) {
    return []
  }

  const shareHref = resolveShareHref(thing)
  const posterImage = getFeaturedPosterImage(thing)
  const posterAlt = getFeaturedPosterAlt(thing, posterImage)
  const description = thing.description ?? null
  const isAiGenerated = Boolean(thing.isAiGenerated)

  const item: VideoFeedItem = {
    id: `${thing._id}:featured`,
    videoKey: 'featured',
    thingId: thing._id,
    thingSlug: fallbackSlug(thing),
    thingTitle: thing.title,
    shareHref,
    title: thing.title,
    caption: null,
    description,
    altText: posterAlt,
    posterImage,
    posterAlt,
    posterUrl: null,
    muxAssetId: extractMuxAssetId(featuredAsset),
    muxPlaybackId: playbackId,
    muxDuration: extractMuxDuration(featuredAsset),
    muxAspectRatio: extractMuxAspectRatio(featuredAsset),
    muxPosterFrameTime: extractThumbTime(featuredAsset),
    isFeatured: true,
    isAiGenerated,
    autoplay: true,
    loop: false,
    muted: true,
    creator: null,
  }

  return [item]
}
