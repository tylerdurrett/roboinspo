import { defineQuery } from 'next-sanity'
import { PostQueryResult, PostsQueryResult } from '../../sanity.types'
import { client } from '@/sanity/client'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get the latest [limit] blog posts
 */
export async function getBlogPosts(limit = 90) {
  const postsQuery = defineQuery(`*[
    _type == "post"
    && defined(slug.current)
  ]|order(publishedAt desc)[0...$limit]{
    _id, 
    title, 
    slug, 
    publishedAt, 
    excerpt, 
    body[]{
      ...,
      _type == "mux.video" => {
        asset->
      }
    }, 
    category->{title, slug}, 
    mainImage, 
    mainVideo{..., asset->},
    author->{name, image}
  }`)

  const posts = await client.fetch(postsQuery, { limit }, options)

  return posts
}

/* A single blog post meta data entry */
export type BlogPostMeta = PostsQueryResult[number]

/**
 * ------------------------------------------------------------------
 * Get a single blog post by category slug and post slug
 */
export async function getBlogPostByCategoryAndSlug(
  categorySlug: string,
  slug: string
) {
  const postQuery = defineQuery(
    `*[_type == "post" && slug.current == $slug && category->slug.current == $categorySlug][0]{
      _id, 
      title, 
      slug, 
      subtitle, 
      intro, 
      category->{title, slug}, 
      publishedAt, 
      editedAt, 
      excerpt, 
      mainImage{..., "caption": caption},
      hideMainImageOnPost,
      mainVideo{..., asset->},
      body[]{
        ...,
        _type == "mux.video" => {
          asset->
        }
      }, 
      author->{name, image}
    }`
  )

  const post = await client.fetch(postQuery, { slug, categorySlug }, options)

  return post
}

export type BlogPost = PostQueryResult
