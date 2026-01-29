import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  getResourcesWithRelationsByHub,
  getSourceTypesForCategory,
} from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'
import { isValidHub } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface PageProps {
  params: Promise<{ hub: string }>
}

export default async function HubWebsitesResourcesPage({ params }: PageProps) {
  const { hub } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const hubSlug = hub as Hub
  const websiteSourceTypes = getSourceTypesForCategory('websites')
  const resources = getResourcesWithRelationsByHub(hubSlug).filter((r) =>
    websiteSourceTypes.includes(r.sourceType)
  )

  return (
    <Suspense>
      <ResourcesFilteredView
        resources={resources}
        hubSlug={hubSlug}
        fixedSourceTypes={websiteSourceTypes}
      />
    </Suspense>
  )
}
