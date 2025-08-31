import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/models/blog'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'NO_BASE_URL'
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [blogPosts] = await Promise.all([getBlogPosts()])

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/work`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/calc/render-cost`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    const blogRoutes: MetadataRoute.Sitemap = blogPosts
      .filter((post) => post.slug?.current && post.category?.slug?.current)
      .map((post) => ({
        url: `${BASE_URL}/blog/${post.category!.slug.current}/${post.slug.current}`,
        lastModified: post.publishedAt
          ? new Date(post.publishedAt)
          : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }))

    return [...staticRoutes, ...blogRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]
  }
}
