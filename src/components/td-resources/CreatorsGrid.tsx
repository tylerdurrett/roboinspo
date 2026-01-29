'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreatorCard } from './CreatorCard'
import type { Creator, Hub } from '@/lib/td-resources'

type SortOption = 'name-asc' | 'name-desc'

interface CreatorWithCount extends Creator {
  resourceCount: number
}

interface CreatorsGridProps {
  creators: CreatorWithCount[]
  hubSlug: Hub
}

export function CreatorsGrid({ creators, hubSlug }: CreatorsGridProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')

  const filteredAndSortedCreators = useMemo(() => {
    let result = creators

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.aliases?.some((a) => a.toLowerCase().includes(searchLower)) ||
          c.bio?.toLowerCase().includes(searchLower)
      )
    }

    return [...result].sort((a, b) => {
      return sort === 'name-asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    })
  }, [creators, search, sort])

  return (
    <div className="space-y-6">
      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
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
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedCreators.length} of {creators.length} creators
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedCreators.map((creator) => (
          <CreatorCard
            key={creator.slug}
            creator={creator}
            resourceCount={creator.resourceCount}
            hubSlug={hubSlug}
          />
        ))}
      </div>

      {filteredAndSortedCreators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No creators match your search.
          </p>
        </div>
      )}
    </div>
  )
}
