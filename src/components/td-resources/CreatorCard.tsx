import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Creator, Hub } from '@/lib/td-resources'
import { getHubConfig } from '@/lib/hubs'

interface CreatorCardProps {
  creator: Creator
  resourceCount?: number
  hubSlug: Hub
}

export function CreatorCard({ creator, resourceCount, hubSlug }: CreatorCardProps) {
  const hubConfig = getHubConfig(hubSlug)

  return (
    <Link
      href={`${hubConfig.basePath}/creators/${creator.slug}`}
      className="block border rounded-lg p-4 hover:border-accent transition-colors"
    >
      <div className="flex items-start gap-4">
        {creator.avatar && (
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{creator.name}</h3>
          {creator.aliases && creator.aliases.length > 0 && (
            <p className="text-sm text-muted-foreground">
              aka {creator.aliases.join(', ')}
            </p>
          )}
          {creator.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {creator.bio}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {creator.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {creator.location}
              </span>
            )}
            {resourceCount !== undefined && resourceCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
