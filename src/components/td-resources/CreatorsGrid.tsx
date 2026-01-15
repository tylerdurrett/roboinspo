'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreatorCard } from './CreatorCard'
import type { Creator } from '@/lib/td-resources'

interface CreatorWithCount extends Creator {
  resourceCount: number
}

interface CreatorsGridProps {
  creators: CreatorWithCount[]
}

export function CreatorsGrid({ creators }: CreatorsGridProps) {
  const [search, setSearch] = useState('')

  const filteredCreators = useMemo(() => {
    if (!search) return creators
    const searchLower = search.toLowerCase()
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.aliases?.some((a) => a.toLowerCase().includes(searchLower)) ||
        c.bio?.toLowerCase().includes(searchLower)
    )
  }, [creators, search])

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredCreators.length} of {creators.length} creators
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCreators.map((creator) => (
          <CreatorCard
            key={creator.slug}
            creator={creator}
            resourceCount={creator.resourceCount}
          />
        ))}
      </div>

      {filteredCreators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No creators match your search.
          </p>
        </div>
      )}
    </div>
  )
}
