import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ResourcesTabNav } from '@/components/td-resources/ResourcesTabNav'
import { isValidHub, getHubConfig } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ hub: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string }>
}): Promise<Metadata> {
  const { hub } = await params
  if (!isValidHub(hub)) {
    return { title: 'Not Found' }
  }
  const config = getHubConfig(hub)
  return {
    title: `${config.name} Resources | Generative Learning`,
    description: `A curated database of ${config.name.toLowerCase()} tutorials, courses, and learning resources.`,
  }
}

export function generateStaticParams() {
  return [{ hub: 'creative-coding' }, { hub: 'agentic-coding' }]
}

export default async function HubResourcesTabsLayout({
  children,
  params,
}: LayoutProps) {
  const { hub } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const config = getHubConfig(hub)

  return (
    <div className="py-16 px-4 sm:px-8 md:px-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{config.name} Resources</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      <ResourcesTabNav hubSlug={hub as Hub} />

      <div className="mt-6">{children}</div>
    </div>
  )
}
