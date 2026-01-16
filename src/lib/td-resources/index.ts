/**
 * TouchDesigner Resources Data Layer
 * Provides typed access to the markdown-based resource database
 */

// Re-export types
export type {
  Creator,
  Organization,
  Resource,
  ResourceWithRelations,
  FilterState,
} from './types'
export { defaultFilterState } from './types'

// Re-export data access functions
export {
  getResources,
  getCreators,
  getOrganizations,
  getResourceBySlug,
  getCreatorBySlug,
  getOrganizationBySlug,
  getFeaturedResources,
  resolveCreators,
  resolveOrganization,
  getResourceWithRelations,
  getResourcesWithRelations,
  getResourcesByCreator,
  getResourcesByOrganization,
  filterResources,
} from './data'

// Re-export hooks
export { useResourceFilters } from './hooks'

// Re-export schemas and constants
export {
  skillLevels,
  topics,
  domains,
  platforms,
  organizationTypes,
  resourceStatuses,
  sourceTypes,
  pricingModels,
  sourceTypeLabels,
  pricingModelLabels,
  skillLevelLabels,
  statusLabels,
  organizationTypeLabels,
  platformLabels,
  // Category exports
  sourceTypeCategories,
  sourceTypeCategoryMap,
  sourceTypeCategoryLabels,
  getSourceTypesForCategory,
} from './schemas'

export type {
  SkillLevel,
  Topic,
  Domain,
  Platform,
  OrganizationType,
  ResourceStatus,
  SourceType,
  PricingModel,
  SourceTypeCategory,
} from './schemas'
