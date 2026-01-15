import { Suspense } from 'react'
import { Metadata } from 'next'
import { getResourcesWithRelations } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'

export const metadata: Metadata = {
  title: 'YouTube Resources | TouchDesigner | Generative Learning',
  description:
    'Curated YouTube tutorials and channels for learning TouchDesigner.',
}

export default function YouTubeResourcesPage() {
  const resources = getResourcesWithRelations().filter(
    (r) => r.sourceType === 'youtube'
  )

  return (
    <Suspense>
      <ResourcesFilteredView resources={resources} fixedSourceType="youtube" />
    </Suspense>
  )
}
