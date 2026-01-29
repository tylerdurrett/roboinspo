import { notFound } from 'next/navigation'
import { getCreatorsByHub, getResourcesByCreatorAndHub } from '@/lib/td-resources'
import { CreatorsGrid } from '@/components/td-resources/CreatorsGrid'
import { isValidHub } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface PageProps {
  params: Promise<{ hub: string }>
}

export default async function HubCreatorsPage({ params }: PageProps) {
  const { hub } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const hubSlug = hub as Hub
  const creators = getCreatorsByHub(hubSlug)

  // Enrich creators with resource counts (hub-filtered)
  const creatorsWithCounts = creators.map((creator) => ({
    ...creator,
    resourceCount: getResourcesByCreatorAndHub(creator.slug, hubSlug).length,
  }))

  // Sort by resource count (most resources first)
  creatorsWithCounts.sort((a, b) => b.resourceCount - a.resourceCount)

  return <CreatorsGrid creators={creatorsWithCounts} hubSlug={hubSlug} />
}
