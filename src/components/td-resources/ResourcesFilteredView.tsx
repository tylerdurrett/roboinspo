'use client'

import { useMemo } from 'react'
import { ResourcesTable } from './ResourcesTable'
import { ResourcesFilters } from './ResourcesFilters'
import {
  filterResources,
  useResourceFilters,
  getHubDefaultFilterState,
  type ResourceWithRelations,
} from '@/lib/td-resources'
import type { Hub } from '@/lib/td-resources/schemas'

interface ResourcesFilteredViewProps {
  resources: ResourceWithRelations[]
  /** Hub context for defaults and filtering */
  hubSlug: Hub
  /** Lock to a single source type (e.g., youtube page) */
  fixedSourceType?: string
  /** Allow filtering within these source types (e.g., websites category page) */
  fixedSourceTypes?: string[]
}

export function ResourcesFilteredView({
  resources,
  hubSlug,
  fixedSourceType,
  fixedSourceTypes,
}: ResourcesFilteredViewProps) {
  const { filters, setFilters } = useResourceFilters(
    hubSlug,
    fixedSourceType,
    fixedSourceTypes
  )

  const hubDefaults = useMemo(() => getHubDefaultFilterState(hubSlug), [hubSlug])

  const hiddenColumns = useMemo(() => {
    // Only hide columns for single-type pages like youtube/patreon
    if (fixedSourceType === 'youtube' || fixedSourceType === 'patreon') {
      return ['sourceType', 'pricingModel']
    }
    return []
  }, [fixedSourceType])

  const hidePricingFilter =
    fixedSourceType === 'youtube' || fixedSourceType === 'patreon'

  // Hide source type filter only for single fixed type (not for categories)
  const hideSourceTypeFilter = !!fixedSourceType

  const filteredResources = useMemo(
    () => filterResources(resources, filters),
    [resources, filters]
  )

  const handleClearFilters = () => {
    setFilters({
      ...hubDefaults,
      sourceType: fixedSourceType ? [fixedSourceType] : [],
    })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    // Count sourceType filter unless it's a single fixed type
    // (for categories, user can filter within category so it should count)
    if (!fixedSourceType && filters.sourceType.length > 0) count++
    if (filters.pricingModel.length > 0) count++
    if (filters.skillLevels.length > 0) count++
    if (filters.topics.length > 0) count++
    if (filters.domains.length > 0) count++
    // Don't count platforms if it's the hub default
    if (
      filters.platforms.length > 0 &&
      JSON.stringify(filters.platforms) !== JSON.stringify(hubDefaults.platforms)
    ) {
      count++
    }
    // Don't count status if it's the hub default
    if (
      filters.status.length > 0 &&
      JSON.stringify(filters.status) !== JSON.stringify(hubDefaults.status)
    ) {
      count++
    }
    return count
  }, [filters, fixedSourceType, hubDefaults])

  return (
    <div className="space-y-6">
      <ResourcesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        hideSourceTypeFilter={hideSourceTypeFilter}
        hidePricingFilter={hidePricingFilter}
        allowedSourceTypes={fixedSourceTypes}
        hubSlug={hubSlug}
      />

      <div className="text-sm text-muted-foreground">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No resources match your filters.
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="mt-2 text-sm text-accent underline hover:no-underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <ResourcesTable
          resources={filteredResources}
          hiddenColumns={hiddenColumns}
          hubSlug={hubSlug}
        />
      )}
    </div>
  )
}
