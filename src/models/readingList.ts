import { defineQuery } from 'next-sanity'
import {
  ReadingListItemQueryResult,
  ReadingListItemsQueryResult,
} from '../../sanity.types'
import { client } from '@/sanity/client'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get the latest [limit] reading list items
 */
export async function getReadingListItems(limit = 90) {
  const readingListItemsQuery = defineQuery(`*[
    _type == "readingList"
    && defined(slug.current)
  ]|order(savedAt desc)[0...$limit]{
    _id, 
    title, 
    slug, 
    originalUrl,
    savedAt, 
    body[]{
      ...,
      _type == "mux.video" => {
        asset->
      }
    }, 
    category->{title, slug}, 
    featuredImage
  }`)

  const readingListItems = await client.fetch(
    readingListItemsQuery,
    { limit },
    options
  )

  return readingListItems
}

/* A single reading list item meta data entry */
export type ReadingListItemMeta = ReadingListItemsQueryResult[number]

/**
 * ------------------------------------------------------------------
 * Get a single reading list item by slug
 */
export async function getReadingListItemBySlug(slug: string) {
  const readingListItemQuery = defineQuery(
    `*[_type == "readingList" && slug.current == $slug][0]{
      _id, 
      title, 
      originalTitle,
      slug, 
      originalUrl,
      discussionUrl,
      category->{title, slug}, 
      savedAt, 
      featuredImage{..., "caption": caption},
      detailedSummary,
      keyPoints,
      conclusion,
      shortSummary,
      gist,
      newTitle,
      discussionDetailedSummary,
      keyAgreeingViewpoints,
      keyOpposingViewpoints,
      sentiment,
      discussionShortSummary,
      discussionGist,
      discussionTitle,
      body[]{
        ...,
        _type == "mux.video" => {
          asset->
        }
      }
    }`
  )

  const readingListItem = await client.fetch(
    readingListItemQuery,
    { slug },
    options
  )

  return readingListItem
}

export type ReadingListItem = ReadingListItemQueryResult
