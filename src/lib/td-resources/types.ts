/**
 * Type definitions for Resource Hubs
 * Re-exports Velite generated types and adds UI-specific types
 */

// Re-export generated types from Velite
export type { Creator, Organization, Resource } from '#content'

import type { Creator, Organization, Resource } from '#content'
import type { Hub } from './schemas'
import { getHubConfig } from '../hubs'

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

/** Default filter state (legacy, uses touchdesigner default) */
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

/** Get default filter state for a specific hub */
export function getHubDefaultFilterState(hubSlug: Hub): FilterState {
  const config = getHubConfig(hubSlug)
  return {
    ...defaultFilterState,
    platforms: config.defaultPlatforms,
  }
}
