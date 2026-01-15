import { Metadata } from 'next'
import { getResourcesWithRelations } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'

export const metadata: Metadata = {
  title: 'Website Resources | TouchDesigner | Generative Learning',
  description: 'Curated websites with TouchDesigner learning content.',
}

export default function WebsitesResourcesPage() {
  const resources = getResourcesWithRelations().filter(
    (r) => r.sourceType === 'website'
  )

  return <ResourcesFilteredView resources={resources} fixedSourceType="website" />
}
