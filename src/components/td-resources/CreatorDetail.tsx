import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResourcesTable } from './ResourcesTable'
import type { Creator, ResourceWithRelations } from '@/lib/td-resources'

interface CreatorDetailProps {
  creator: Creator
  resources: ResourceWithRelations[]
}

const socialConfig: Record<string, { label: string; baseUrl: string }> = {
  youtube: { label: 'YouTube', baseUrl: 'https://youtube.com/' },
  patreon: { label: 'Patreon', baseUrl: 'https://patreon.com/' },
  github: { label: 'GitHub', baseUrl: 'https://github.com/' },
  twitter: { label: 'Twitter', baseUrl: 'https://twitter.com/' },
  instagram: { label: 'Instagram', baseUrl: 'https://instagram.com/' },
  linkedin: { label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  discord: { label: 'Discord', baseUrl: '' },
}

export function CreatorDetail({ creator, resources }: CreatorDetailProps) {
  const socials = creator.socials ?? {}
  const socialEntries = Object.entries(socials).filter(
    ([, handle]) => handle != null && handle !== ''
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/touchdesigner/resources/creators"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Creators
      </Link>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {creator.avatar && (
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{creator.name}</h1>
          {creator.aliases && creator.aliases.length > 0 && (
            <p className="text-muted-foreground">
              aka {creator.aliases.join(', ')}
            </p>
          )}
          {creator.bio && (
            <p className="text-lg text-muted-foreground mt-2">{creator.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            {creator.location && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {creator.location}
              </span>
            )}
            {creator.website && (
              <a
                href={creator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Social links */}
      {socialEntries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Social Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {socialEntries.map(([platform, handle]) => {
              const config = socialConfig[platform]
              if (!config) return null
              const url = config.baseUrl ? `${config.baseUrl}${handle}` : '#'
              return (
                <Button key={platform} variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {config.label}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Body content */}
      {creator.body && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            About
          </h2>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: creator.body }}
          />
        </div>
      )}

      {/* Resources */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Resources ({resources.length})
        </h2>
        {resources.length > 0 ? (
          <ResourcesTable resources={resources} hiddenColumns={['creators']} />
        ) : (
          <p className="text-muted-foreground">
            No resources linked to this creator yet.
          </p>
        )}
      </div>
    </div>
  )
}
