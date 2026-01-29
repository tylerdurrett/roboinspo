import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  sourceTypeLabels,
  pricingModelLabels,
  skillLevelLabels,
  statusLabels,
  organizationTypeLabels,
  type ResourceWithRelations,
  type Creator,
  type Organization,
  type Hub,
} from '@/lib/td-resources'
import { getHubConfig } from '@/lib/hubs'
import { cn } from '@/lib/utils'

interface ResourceDetailProps {
  resource: ResourceWithRelations
  hubSlug: Hub
}

/** Badge color classes based on status */
function getStatusClasses(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'inactive':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'archived':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default:
      return ''
  }
}

/** Badge color classes based on pricing */
function getPricingClasses(pricing: string): string {
  switch (pricing) {
    case 'free':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'freemium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'paid':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default:
      return ''
  }
}

/** Convert kebab-case to Title Case */
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {creator.avatar && (
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold">{creator.name}</h4>
          {creator.aliases && creator.aliases.length > 0 && (
            <p className="text-sm text-muted-foreground">
              aka {creator.aliases.join(', ')}
            </p>
          )}
          {creator.bio && (
            <p className="text-sm text-muted-foreground mt-1">{creator.bio}</p>
          )}
          {creator.location && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {creator.location}
            </p>
          )}
          {creator.website && (
            <a
              href={creator.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline mt-1 flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {organization.logo && (
          <img
            src={organization.logo}
            alt={organization.name}
            className="w-12 h-12 rounded object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{organization.name}</h4>
            <Badge variant="outline" className="text-xs">
              {organizationTypeLabels[organization.type]}
            </Badge>
          </div>
          {organization.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {organization.description}
            </p>
          )}
          {organization.location && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {organization.location}
            </p>
          )}
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline mt-1 flex items-center gap-1"
          >
            <Globe className="h-3 w-3" />
            {organization.website}
          </a>
        </div>
      </div>
    </div>
  )
}

export function ResourceDetail({ resource, hubSlug }: ResourceDetailProps) {
  const hubConfig = getHubConfig(hubSlug)
  const hasTopics = resource.topics && resource.topics.length > 0
  const hasDomains = resource.domains && resource.domains.length > 0
  const hasSkillLevels = resource.skillLevels && resource.skillLevels.length > 0
  const hasCreators = resource.creators && resource.creators.length > 0
  const hasOrganization = !!resource.organization

  return (
    <div className="py-16 px-4 sm:px-8 md:px-12 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href={hubConfig.basePath}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Resources
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>

        {/* Primary action */}
        <Button asChild className="mb-4">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            Visit Resource
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">
            {sourceTypeLabels[resource.sourceType]}
          </Badge>
          <Badge
            variant="outline"
            className={cn(getPricingClasses(resource.pricingModel))}
          >
            {pricingModelLabels[resource.pricingModel]}
          </Badge>
          <Badge
            variant="outline"
            className={cn(getStatusClasses(resource.status))}
          >
            {statusLabels[resource.status]}
          </Badge>
          {resource.featured && <Badge variant="default">Featured</Badge>}
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground">{resource.description}</p>
      </div>

      {/* Skill levels */}
      {hasSkillLevels && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Skill Levels
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.skillLevels!.map((level) => (
              <Badge key={level} variant="secondary">
                {skillLevelLabels[level]}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {hasTopics && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.topics!.map((topic) => (
              <Badge key={topic} variant="outline">
                {toTitleCase(topic)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Domains */}
      {hasDomains && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Domains
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.domains!.map((domain) => (
              <Badge key={domain} variant="outline">
                {toTitleCase(domain)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Creators */}
      {hasCreators && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {resource.creators!.length === 1 ? 'Creator' : 'Creators'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {resource.creators!.map((creator) => (
              <CreatorCard key={creator.slug} creator={creator} />
            ))}
          </div>
        </div>
      )}

      {/* Organization */}
      {hasOrganization && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Organization
          </h3>
          <OrganizationCard organization={resource.organization!} />
        </div>
      )}

      {/* Body content (markdown) */}
      {resource.body && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Notes
          </h3>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.body }}
          />
        </div>
      )}

      {/* Last verified */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Last verified: {new Date(resource.lastVerified).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
