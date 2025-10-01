import type { VideoFeedPage } from './core/types'

/**
 * Fetches a page of feed items from the backend. Implementations should handle
 * cursor pagination and return the next cursor when more data is available.
 */
export type FetchVideoFeedPage = (params: {
  cursor?: string
  limit?: number
}) => Promise<VideoFeedPage>

/**
 * Placeholder implementation. This is intentionally left unimplemented so each
 * host environment decides how to fetch feed pages.
 */
export const fetchVideoFeedPage: FetchVideoFeedPage = async () => {
  throw new Error('unimplemented')
}

export { mapThingToFeedItems } from './core/types'
