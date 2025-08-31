'use client'

import { useState, useMemo } from 'react'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { CategoryPills } from '@/components/blog/CategoryPills'
import { BlogPostMeta } from '@/models/blog'
import { Category } from '@/models/category'

interface BlogPageClientProps {
  posts: BlogPostMeta[]
  categories: Category[]
}

export function BlogPageClient({ posts, categories }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return posts
    }
    return posts.filter(
      (post) => post.category?.slug.current === selectedCategory
    )
  }, [posts, selectedCategory])

  return (
    <div className="relative">
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      {filteredPosts.length === 0 ? (
        <p className="px-4 text-muted-foreground sm:px-6 lg:px-8">
          {selectedCategory
            ? 'No posts in this category yet.'
            : 'No posts yet. Check back soon!'}
        </p>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] rounded-2xl overflow-hidden relative">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
