'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { defaultFilterState, type FilterState } from './types'

/**
 * Hook for managing resource filters via URL search params.
 * Enables shareable/bookmarkable filtered views.
 *
 * @param fixedSourceType - If provided, locks the sourceType filter to this value
 */
export function useResourceFilters(fixedSourceType?: string) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = useMemo((): FilterState => {
    return {
      search: searchParams.get('search') ?? '',
      sourceType: fixedSourceType
        ? [fixedSourceType]
        : searchParams.getAll('sourceType'),
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
  }, [searchParams, fixedSourceType])

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
