'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MultiSelect } from './MultiSelect'
import {
  sourceTypes,
  sourceTypeLabels,
  pricingModels,
  pricingModelLabels,
  skillLevels,
  skillLevelLabels,
  topics,
  domains,
  platforms,
  platformLabels,
  resourceStatuses,
  statusLabels,
  type FilterState,
} from '@/lib/td-resources'

interface ResourcesFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFilterCount: number
  hideSourceTypeFilter?: boolean
  hidePricingFilter?: boolean
  /** If provided, limit source type options to these values (for category pages) */
  allowedSourceTypes?: string[]
}

/** Convert kebab-case to Title Case */
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Build options array from const array with labels */
function buildOptions<T extends string>(
  values: readonly T[],
  labels?: Record<T, string>
): { value: T; label: string }[] {
  return values.map((value) => ({
    value,
    label: labels?.[value] ?? toTitleCase(value),
  }))
}

export function ResourcesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  hideSourceTypeFilter = false,
  hidePricingFilter = false,
  allowedSourceTypes,
}: ResourcesFiltersProps) {
  const sourceTypeOptions = buildOptions(sourceTypes, sourceTypeLabels).filter(
    (opt) => !allowedSourceTypes || allowedSourceTypes.includes(opt.value)
  )
  const pricingOptions = buildOptions(pricingModels, pricingModelLabels)
  const skillLevelOptions = buildOptions(skillLevels, skillLevelLabels)
  const topicOptions = buildOptions(topics)
  const domainOptions = buildOptions(domains)
  const platformOptions = buildOptions(platforms, platformLabels)
  const statusOptions = buildOptions(resourceStatuses, statusLabels)

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
        {filters.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => updateFilter('search', '')}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3 items-center">
        {!hideSourceTypeFilter && (
          <MultiSelect
            options={sourceTypeOptions}
            selected={filters.sourceType}
            onChange={(value) => updateFilter('sourceType', value)}
            placeholder="Source Type"
            searchPlaceholder="Search types..."
          />
        )}

        {!hidePricingFilter && (
          <MultiSelect
            options={pricingOptions}
            selected={filters.pricingModel}
            onChange={(value) => updateFilter('pricingModel', value)}
            placeholder="Pricing"
            searchPlaceholder="Search pricing..."
          />
        )}

        <MultiSelect
          options={skillLevelOptions}
          selected={filters.skillLevels}
          onChange={(value) => updateFilter('skillLevels', value)}
          placeholder="Skill Level"
          searchPlaceholder="Search levels..."
        />

        <MultiSelect
          options={topicOptions}
          selected={filters.topics}
          onChange={(value) => updateFilter('topics', value)}
          placeholder="Topics"
          searchPlaceholder="Search topics..."
        />

        <MultiSelect
          options={domainOptions}
          selected={filters.domains}
          onChange={(value) => updateFilter('domains', value)}
          placeholder="Domains"
          searchPlaceholder="Search domains..."
        />

        <MultiSelect
          options={platformOptions}
          selected={filters.platforms}
          onChange={(value) => updateFilter('platforms', value)}
          placeholder="Platforms"
          searchPlaceholder="Search platforms..."
        />

        <MultiSelect
          options={statusOptions}
          selected={filters.status}
          onChange={(value) => updateFilter('status', value)}
          placeholder="Status"
          searchPlaceholder="Search status..."
        />

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9"
          >
            Clear filters
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
