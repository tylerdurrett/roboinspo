import { BlogPageClient } from '@/components/blog/BlogPageClient'
import { getBlogPosts } from '@/models/blog'
import { getCategories } from '@/models/category'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Robo Inspo Slop Review',
  description: '',
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories(),
  ])

  return (
    <div className="pt-16 px-4 sm:px-8 md:px-12">
      <div className="relative isolate py-16 mb-8">
        <h1 className="relative z-10 px-4 text-5xl sm:text-7xl md:text-8xl sm:px-6 lg:px-8 font-hepta-slab uppercase text-foreground text-center">
          Blog
        </h1>
      </div>
      <BlogPageClient posts={posts} categories={categories} />
    </div>
  )
}
