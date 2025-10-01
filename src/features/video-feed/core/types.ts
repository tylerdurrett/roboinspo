import type { MuxVideoAsset, ThingQueryResult } from '../../../../sanity.types'

type Thing = NonNullable<ThingQueryResult>
type ThingFeaturedImage = NonNullable<Thing['featuredImage']>

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

const fallbackSlug = (thing: Thing): string | null =>
  thing.slug?.current ?? null

const resolveShareHref = (thing: Thing): string => {
  const segment = fallbackSlug(thing) ?? thing._id
  return `/thing/${segment}`
}

const getFeaturedPosterImage = (thing: Thing): VideoFeedPosterImage | null => {
  const image = thing.featuredImage

  if (image?.asset) {
    return image
  }

  return null
}

const getFeaturedPosterAlt = (
  thing: Thing,
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

  const resolvedThing = thing as Thing

  const featuredAsset = resolvedThing.featuredVideo?.asset ?? null
  const playbackId = extractPlaybackId(featuredAsset)

  if (!playbackId) {
    return []
  }

  const shareHref = resolveShareHref(resolvedThing)
  const posterImage = getFeaturedPosterImage(resolvedThing)
  const posterAlt = getFeaturedPosterAlt(resolvedThing, posterImage)
  const description = resolvedThing.description ?? null
  const isAiGenerated = Boolean(resolvedThing.isAiGenerated)

  const item: VideoFeedItem = {
    id: `${resolvedThing._id}:featured`,
    videoKey: 'featured',
    thingId: resolvedThing._id,
    thingSlug: fallbackSlug(resolvedThing),
    thingTitle: resolvedThing.title,
    shareHref,
    title: resolvedThing.title,
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
