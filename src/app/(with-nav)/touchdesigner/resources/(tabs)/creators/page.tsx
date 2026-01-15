import { Metadata } from 'next'
import { getCreators, getResourcesByCreator } from '@/lib/td-resources'
import { CreatorsGrid } from '@/components/td-resources/CreatorsGrid'

export const metadata: Metadata = {
  title: 'Creators | TouchDesigner Resources | Generative Learning',
  description:
    'Browse TouchDesigner educators, tutorial creators, and content producers.',
}

export default function CreatorsPage() {
  const creators = getCreators()

  // Enrich creators with resource counts
  const creatorsWithCounts = creators.map((creator) => ({
    ...creator,
    resourceCount: getResourcesByCreator(creator.slug).length,
  }))

  // Sort by resource count (most resources first)
  creatorsWithCounts.sort((a, b) => b.resourceCount - a.resourceCount)

  return <CreatorsGrid creators={creatorsWithCounts} />
}
