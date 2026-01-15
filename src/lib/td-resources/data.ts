/**
 * Data access functions for TouchDesigner Resources
 * Provides typed access to Velite-generated content with relationship resolution
 */

import { creators, organizations, resources } from '#content'
import type { Creator, Organization, Resource } from '#content'
import type { ResourceWithRelations, FilterState } from './types'

// Build lookup maps for efficient relationship resolution
const creatorsMap = new Map(creators.map((c) => [c.slug, c]))
const orgsMap = new Map(organizations.map((o) => [o.slug, o]))

/** Get all resources */
export function getResources(): Resource[] {
  return resources
}

/** Get all creators */
export function getCreators(): Creator[] {
  return creators
}

/** Get all organizations */
export function getOrganizations(): Organization[] {
  return organizations
}

/** Get a single resource by slug */
export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug)
}

/** Get a single creator by slug */
export function getCreatorBySlug(slug: string): Creator | undefined {
  return creatorsMap.get(slug)
}

/** Get a single organization by slug */
export function getOrganizationBySlug(slug: string): Organization | undefined {
  return orgsMap.get(slug)
}

/** Get featured resources (active and featured flag set) */
export function getFeaturedResources(): Resource[] {
  return resources.filter((r) => r.featured && r.status === 'active')
}

/** Resolve creator references for a resource */
export function resolveCreators(resource: Resource): Creator[] {
  if (!resource.creatorSlugs?.length) return []
  return resource.creatorSlugs
    .map((slug) => creatorsMap.get(slug))
    .filter((c): c is Creator => c !== undefined)
}

/** Resolve organization reference for a resource */
export function resolveOrganization(
  resource: Resource
): Organization | undefined {
  if (!resource.orgSlug) return undefined
  return orgsMap.get(resource.orgSlug)
}

/** Get a resource with all relationships resolved */
export function getResourceWithRelations(
  slug: string
): ResourceWithRelations | undefined {
  const resource = getResourceBySlug(slug)
  if (!resource) return undefined

  return {
    ...resource,
    creators: resolveCreators(resource),
    organization: resolveOrganization(resource),
  }
}

/** Get all resources with relationships resolved */
export function getResourcesWithRelations(): ResourceWithRelations[] {
  return resources.map((resource) => ({
    ...resource,
    creators: resolveCreators(resource),
    organization: resolveOrganization(resource),
  }))
}

/** Get resources by creator slug */
export function getResourcesByCreator(creatorSlug: string): Resource[] {
  return resources.filter((r) => r.creatorSlugs?.includes(creatorSlug))
}

/** Get resources by organization slug */
export function getResourcesByOrganization(orgSlug: string): Resource[] {
  return resources.filter((r) => r.orgSlug === orgSlug)
}

/** Filter resources based on filter state */
export function filterResources(
  allResources: Resource[],
  filters: FilterState
): Resource[] {
  return allResources.filter((resource) => {
    // Search filter (title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = resource.title.toLowerCase().includes(searchLower)
      const matchesDescription = resource.description
        .toLowerCase()
        .includes(searchLower)
      if (!matchesTitle && !matchesDescription) return false
    }

    // Source type filter (OR within category)
    if (filters.sourceType.length > 0) {
      if (!filters.sourceType.includes(resource.sourceType)) return false
    }

    // Pricing model filter (OR within category)
    if (filters.pricingModel.length > 0) {
      if (!filters.pricingModel.includes(resource.pricingModel)) return false
    }

    // Skill levels filter (OR - resource matches if it has ANY of the selected levels)
    if (filters.skillLevels.length > 0) {
      const resourceLevels = resource.skillLevels ?? []
      const hasMatchingLevel = resourceLevels.some((level) =>
        filters.skillLevels.includes(level)
      )
      if (!hasMatchingLevel) return false
    }

    // Topics filter (OR - resource matches if it has ANY of the selected topics)
    if (filters.topics.length > 0) {
      const resourceTopics = resource.topics ?? []
      const hasMatchingTopic = resourceTopics.some((topic) =>
        filters.topics.includes(topic)
      )
      if (!hasMatchingTopic) return false
    }

    // Domains filter (OR - resource matches if it has ANY of the selected domains)
    if (filters.domains.length > 0) {
      const resourceDomains = resource.domains ?? []
      const hasMatchingDomain = resourceDomains.some((domain) =>
        filters.domains.includes(domain)
      )
      if (!hasMatchingDomain) return false
    }

    // Status filter (OR within category)
    if (filters.status.length > 0) {
      if (!filters.status.includes(resource.status)) return false
    }

    return true
  })
}
