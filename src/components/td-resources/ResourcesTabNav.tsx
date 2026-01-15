'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/touchdesigner/resources', label: 'All' },
  { href: '/touchdesigner/resources/creators', label: 'Creators' },
  { href: '/touchdesigner/resources/youtube', label: 'YouTube' },
  { href: '/touchdesigner/resources/patreon', label: 'Patreon' },
  { href: '/touchdesigner/resources/websites', label: 'Websites' },
] as const

export function ResourcesTabNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/touchdesigner/resources') {
      // "All" tab is only active on exact match
      return pathname === href
    }
    // Other tabs are active if pathname starts with their href
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'hover:text-foreground',
            'border-b-2 -mb-px',
            isActive(tab.href)
              ? 'border-accent text-foreground'
              : 'border-transparent text-muted-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
