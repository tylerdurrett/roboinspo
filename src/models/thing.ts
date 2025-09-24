import { defineQuery } from 'next-sanity'
import { ThingQueryResult, ThingsQueryResult } from '../../sanity.types'
import { client } from '@/sanity/client'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get the latest [limit] things
 */
export async function getThings(limit = 90) {
  const thingsQuery = defineQuery(`*[
    _type == "thing"
  ]|order(_createdAt desc)[0...$limit]{
    _id,
    title,
    description,
    featuredImage{..., "caption": caption, "alt": alt},
    featuredVideo{..., asset->},
    featuredVideoThumb{..., asset->},
    images[]{
      ...,
      "caption": caption,
      "alt": alt
    },
    videos[]{
      file{..., asset->},
      title,
      alt,
      caption,
      poster{..., "alt": alt},
      autoplay,
      loop,
      muted
    },
    isAiGenerated,
    body[]{
      ...,
      _type == "mux.video" => {
        asset->
      }
    }
  }`)

  const things = await client.fetch(thingsQuery, { limit }, options)

  return things
}

/* A single thing meta data entry */
export type ThingMeta = ThingsQueryResult[number]

/**
 * ------------------------------------------------------------------
 * Get a single thing by ID
 */
export async function getThingById(id: string) {
  const thingQuery = defineQuery(
    `*[_type == "thing" && _id == $id][0]{
      _id,
      title,
      description,
      featuredImage{..., "caption": caption, "alt": alt},
      featuredVideo{..., asset->},
      featuredVideoThumb{..., asset->},
      images[]{
        ...,
        "caption": caption,
        "alt": alt
      },
      videos[]{
        file{..., asset->},
        title,
        alt,
        caption,
        poster{..., "alt": alt},
        autoplay,
        loop,
        muted
      },
      isAiGenerated,
      body[]{
        ...,
        _type == "mux.video" => {
          asset->
        }
      }
    }`
  )

  const thing = await client.fetch(thingQuery, { id }, options)

  return thing
}

export type Thing = ThingQueryResult
