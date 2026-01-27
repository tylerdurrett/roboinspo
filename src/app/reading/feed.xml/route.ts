import { Feed } from 'feed'
import {
  getReadingListItems,
  type ReadingListItemMeta,
} from '@/models/readingList'

const SITE_TITLE = 'TD Stuff'
const FEED_TITLE = `${SITE_TITLE} - Reading List`
const FEED_DESCRIPTION = 'Articles and resources worth sharing'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!baseUrl) {
    return new Response('Site URL not configured', { status: 500 })
  }

  const items = await getReadingListItems({ limit: 50 })

  const feed = new Feed({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    id: `${baseUrl}/reading`,
    link: `${baseUrl}/reading`,
    language: 'en',
    image: `${baseUrl}/static/opengraph.jpg`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: items[0]?.savedAt ? new Date(items[0].savedAt) : new Date(),
    feedLinks: {
      rss2: `${baseUrl}/reading/feed.xml`,
    },
  })

  for (const item of items) {
    feed.addItem({
      title: item.title,
      id: `${baseUrl}/reading/${item.slug.current}`,
      link: `${baseUrl}/reading/${item.slug.current}`,
      description: getDescription(item),
      content: generateContent(item, baseUrl),
      date: item.savedAt ? new Date(item.savedAt) : new Date(),
      category: item.categories?.map((cat) => ({ name: cat.title })) ?? [],
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function getDescription(item: ReadingListItemMeta): string {
  return item.gist || item.shortSummary || `Reading list item: ${item.title}`
}

function generateContent(item: ReadingListItemMeta, baseUrl: string): string {
  const parts: string[] = []

  if (item.shortSummary) {
    parts.push(`<p>${escapeHtml(item.shortSummary)}</p>`)
  }

  if (item.keyPoints && item.keyPoints.length > 0) {
    parts.push('<h3>Key Points</h3>')
    parts.push('<ul>')
    for (const point of item.keyPoints) {
      parts.push(`<li>${escapeHtml(point)}</li>`)
    }
    parts.push('</ul>')
  }

  if (item.sentiment) {
    parts.push('<h3>Sentiment</h3>')
    parts.push(`<p>${escapeHtml(item.sentiment)}</p>`)
  }

  if (item.keyAgreeingViewpoints && item.keyAgreeingViewpoints.length > 0) {
    parts.push('<h3>In Agreement</h3>')
    parts.push('<ul>')
    for (const point of item.keyAgreeingViewpoints) {
      parts.push(`<li>${escapeHtml(point)}</li>`)
    }
    parts.push('</ul>')
  }

  if (item.keyOpposingViewpoints && item.keyOpposingViewpoints.length > 0) {
    parts.push('<h3>Opposed</h3>')
    parts.push('<ul>')
    for (const point of item.keyOpposingViewpoints) {
      parts.push(`<li>${escapeHtml(point)}</li>`)
    }
    parts.push('</ul>')
  }

  if (item.originalUrl) {
    parts.push(
      `<p><a href="${escapeHtml(item.originalUrl)}">Read Original Article</a></p>`
    )
  }

  parts.push(
    `<p><a href="${baseUrl}/reading/${item.slug.current}">View on ${SITE_TITLE}</a></p>`
  )

  return parts.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
