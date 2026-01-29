import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getResourcesWithRelationsByHub } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'
import { isValidHub } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface PageProps {
  params: Promise<{ hub: string }>
}

export default async function HubYouTubeResourcesPage({ params }: PageProps) {
  const { hub } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const hubSlug = hub as Hub
  const resources = getResourcesWithRelationsByHub(hubSlug).filter(
    (r) => r.sourceType === 'youtube'
  )

  return (
    <Suspense>
      <ResourcesFilteredView
        resources={resources}
        hubSlug={hubSlug}
        fixedSourceType="youtube"
      />
    </Suspense>
  )
}
