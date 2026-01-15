import { Suspense } from 'react'
import { Metadata } from 'next'
import { getResourcesWithRelations } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'

export const metadata: Metadata = {
  title: 'TouchDesigner Resources | Generative Learning',
  description:
    'A curated database of TouchDesigner tutorials, courses, and learning resources.',
}

export default function TouchDesignerResourcesPage() {
  const resources = getResourcesWithRelations()
  return (
    <Suspense>
      <ResourcesFilteredView resources={resources} />
    </Suspense>
  )
}
