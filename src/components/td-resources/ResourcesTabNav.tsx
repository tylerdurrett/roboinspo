'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getHubConfig, type HubConfig } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources/schemas'

interface ResourcesTabNavProps {
  hubSlug: Hub
}

export function ResourcesTabNav({ hubSlug }: ResourcesTabNavProps) {
  const pathname = usePathname()
  const config: HubConfig = getHubConfig(hubSlug)

  const isActive = (tabPath: string) => {
    const fullPath = `${config.basePath}${tabPath}`
    if (tabPath === '') {
      // "All" tab is only active on exact match
      return pathname === fullPath
    }
    // Other tabs are active if pathname starts with their full path
    return pathname.startsWith(fullPath)
  }

  return (
    <nav className="flex gap-1 border-b border-border">
      {config.tabs.map((tab) => {
        const fullPath = `${config.basePath}${tab.path}`
        return (
          <Link
            key={tab.path}
            href={fullPath}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'hover:text-foreground',
              'border-b-2 -mb-px',
              isActive(tab.path)
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
