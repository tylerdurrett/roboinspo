'use client'

import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { ExternalLink, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  sourceTypeLabels,
  pricingModelLabels,
  skillLevelLabels,
  statusLabels,
  type ResourceWithRelations,
} from '@/lib/td-resources'
import { cn } from '@/lib/utils'

const columnHelper = createColumnHelper<ResourceWithRelations>()

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

/** Get source type icon or emoji */
function getSourceTypeIcon(sourceType: string): string {
  switch (sourceType) {
    case 'youtube':
      return '📺'
    case 'patreon':
      return '🎨'
    case 'blog':
      return '📝'
    case 'course':
      return '🎓'
    case 'github':
      return '💻'
    case 'aggregator':
      return '🔗'
    case 'forum':
      return '💬'
    case 'discord':
      return '💭'
    case 'website':
      return '🌐'
    case 'social':
      return '📱'
    default:
      return '📄'
  }
}

export const columns = [
  columnHelper.accessor('title', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 -ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const resource = row.original
      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/touchdesigner/resources/${resource.slug}`}
            className="font-medium hover:underline"
          >
            {resource.title}
          </Link>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            title="Open resource in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )
    },
  }),
  columnHelper.accessor('sourceType', {
    header: 'Type',
    cell: ({ getValue }) => {
      const sourceType = getValue()
      return (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span>{getSourceTypeIcon(sourceType)}</span>
          <span className="text-sm">{sourceTypeLabels[sourceType]}</span>
        </span>
      )
    },
  }),
  columnHelper.accessor('pricingModel', {
    header: 'Pricing',
    cell: ({ getValue }) => {
      const pricing = getValue()
      return (
        <Badge variant="outline" className={cn(getPricingClasses(pricing))}>
          {pricingModelLabels[pricing]}
        </Badge>
      )
    },
  }),
  columnHelper.accessor('skillLevels', {
    header: 'Skill Levels',
    cell: ({ getValue }) => {
      const levels = getValue() ?? []
      if (levels.length === 0)
        return <span className="text-muted-foreground">-</span>
      return (
        <div className="flex flex-wrap gap-1">
          {levels.map((level) => (
            <Badge key={level} variant="secondary" className="text-xs">
              {skillLevelLabels[level]}
            </Badge>
          ))}
        </div>
      )
    },
  }),
  columnHelper.accessor('creators', {
    header: 'Creator(s)',
    cell: ({ getValue }) => {
      const creators = getValue() ?? []
      if (creators.length === 0)
        return <span className="text-muted-foreground">-</span>
      return (
        <span className="text-sm">
          {creators.map((c) => c.name).join(', ')}
        </span>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 -ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge variant="outline" className={cn(getStatusClasses(status))}>
          {statusLabels[status]}
        </Badge>
      )
    },
  }),
  columnHelper.accessor('lastVerified', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 -ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Verified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const date = getValue()
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  }),
]
