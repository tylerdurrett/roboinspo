'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { defaultFilterState, type FilterState } from './types'

/**
 * Hook for managing resource filters via URL search params.
 * Enables shareable/bookmarkable filtered views.
 *
 * @param fixedSourceType - If provided, locks the sourceType filter to this single value
 * @param fixedSourceTypes - If provided, allows filtering within these source types (for category pages)
 */
export function useResourceFilters(
  fixedSourceType?: string,
  fixedSourceTypes?: string[]
) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = useMemo((): FilterState => {
    // Determine source type filter value
    let sourceTypeFilter: string[]
    if (fixedSourceType) {
      // Single fixed type (e.g., youtube page)
      sourceTypeFilter = [fixedSourceType]
    } else if (fixedSourceTypes && fixedSourceTypes.length > 0) {
      // Category with multiple allowed types - allow URL filtering within category
      const urlTypes = searchParams.getAll('sourceType')
      if (urlTypes.length > 0) {
        // Only include URL params that are valid for this category
        sourceTypeFilter = urlTypes.filter((t) => fixedSourceTypes.includes(t))
      } else {
        // No URL filter means show all in category (empty array = no filter)
        sourceTypeFilter = []
      }
    } else {
      sourceTypeFilter = searchParams.getAll('sourceType')
    }

    return {
      search: searchParams.get('search') ?? '',
      sourceType: sourceTypeFilter,
      pricingModel: searchParams.getAll('pricing'),
      skillLevels: searchParams.getAll('level'),
      topics: searchParams.getAll('topic'),
      domains: searchParams.getAll('domain'),
      platforms:
        searchParams.getAll('platform').length > 0
          ? searchParams.getAll('platform')
          : defaultFilterState.platforms,
      status:
        searchParams.getAll('status').length > 0
          ? searchParams.getAll('status')
          : defaultFilterState.status,
    }
  }, [searchParams, fixedSourceType, fixedSourceTypes])

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()

      if (newFilters.search) params.set('search', newFilters.search)

      // Only set sourceType in URL if not fixed
      if (!fixedSourceType) {
        newFilters.sourceType.forEach((v) => params.append('sourceType', v))
      }

      newFilters.pricingModel.forEach((v) => params.append('pricing', v))
      newFilters.skillLevels.forEach((v) => params.append('level', v))
      newFilters.topics.forEach((v) => params.append('topic', v))
      newFilters.domains.forEach((v) => params.append('domain', v))

      // Only include non-default platform/status
      if (
        JSON.stringify(newFilters.platforms) !==
        JSON.stringify(defaultFilterState.platforms)
      ) {
        newFilters.platforms.forEach((v) => params.append('platform', v))
      }
      if (
        JSON.stringify(newFilters.status) !==
        JSON.stringify(defaultFilterState.status)
      ) {
        newFilters.status.forEach((v) => params.append('status', v))
      }

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, fixedSourceType]
  )

  return { filters, setFilters }
}
