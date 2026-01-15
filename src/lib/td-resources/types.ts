/**
 * Type definitions for TouchDesigner Resources
 * Re-exports Velite generated types and adds UI-specific types
 */

// Re-export generated types from Velite
export type { Creator, Organization, Resource } from '#content'

import type { Creator, Organization, Resource } from '#content'

/** Resource with resolved creator and organization relationships */
export interface ResourceWithRelations extends Resource {
  creators?: Creator[]
  organization?: Organization
}

/** Filter state for the resources table/grid */
export interface FilterState {
  sourceType: string[]
  pricingModel: string[]
  skillLevels: string[]
  topics: string[]
  domains: string[]
  platforms: string[]
  status: string[]
  search: string
}

/** Default filter state */
export const defaultFilterState: FilterState = {
  sourceType: [],
  pricingModel: [],
  skillLevels: [],
  topics: [],
  domains: [],
  platforms: ['touchdesigner'],
  status: ['active'],
  search: '',
}
