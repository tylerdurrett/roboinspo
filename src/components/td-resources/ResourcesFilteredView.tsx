'use client'

import { useMemo } from 'react'
import { ResourcesTable } from './ResourcesTable'
import { ResourcesFilters } from './ResourcesFilters'
import {
  filterResources,
  useResourceFilters,
  defaultFilterState,
  type ResourceWithRelations,
} from '@/lib/td-resources'

interface ResourcesFilteredViewProps {
  resources: ResourceWithRelations[]
  fixedSourceType?: string
}

export function ResourcesFilteredView({
  resources,
  fixedSourceType,
}: ResourcesFilteredViewProps) {
  const { filters, setFilters } = useResourceFilters(fixedSourceType)

  const filteredResources = useMemo(
    () => filterResources(resources, filters),
    [resources, filters]
  )

  const handleClearFilters = () => {
    setFilters({
      ...defaultFilterState,
      sourceType: fixedSourceType ? [fixedSourceType] : [],
    })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (!fixedSourceType && filters.sourceType.length > 0) count++
    if (filters.pricingModel.length > 0) count++
    if (filters.skillLevels.length > 0) count++
    if (filters.topics.length > 0) count++
    if (filters.domains.length > 0) count++
    // Don't count platforms if it's just ['touchdesigner'] (the default)
    if (
      filters.platforms.length > 0 &&
      !(
        filters.platforms.length === 1 &&
        filters.platforms[0] === 'touchdesigner'
      )
    ) {
      count++
    }
    // Don't count status if it's just ['active'] (the default)
    if (
      filters.status.length > 0 &&
      !(filters.status.length === 1 && filters.status[0] === 'active')
    ) {
      count++
    }
    return count
  }, [filters, fixedSourceType])

  return (
    <div className="space-y-6">
      <ResourcesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        hideSourceTypeFilter={!!fixedSourceType}
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
        <ResourcesTable resources={filteredResources} />
      )}
    </div>
  )
}
