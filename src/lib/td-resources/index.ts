/**
 * TouchDesigner Resources Data Layer
 * Provides typed access to the markdown-based resource database
 */

// Re-export types
export type { Creator, Organization, Resource, ResourceWithRelations, FilterState } from './types'
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

// Re-export schemas and constants
export {
  skillLevels,
  topics,
  domains,
  organizationTypes,
  resourceStatuses,
  sourceTypes,
  pricingModels,
  sourceTypeLabels,
  pricingModelLabels,
  skillLevelLabels,
  statusLabels,
  organizationTypeLabels,
} from './schemas'

export type {
  SkillLevel,
  Topic,
  Domain,
  OrganizationType,
  ResourceStatus,
  SourceType,
  PricingModel,
} from './schemas'
