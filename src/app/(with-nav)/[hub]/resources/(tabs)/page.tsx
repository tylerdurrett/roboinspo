import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getResourcesWithRelationsByHub } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'
import { isValidHub } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface PageProps {
  params: Promise<{ hub: string }>
}

export default async function HubResourcesPage({ params }: PageProps) {
  const { hub } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const resources = getResourcesWithRelationsByHub(hub as Hub)

  return (
    <Suspense>
      <ResourcesFilteredView resources={resources} hubSlug={hub as Hub} />
    </Suspense>
  )
}
