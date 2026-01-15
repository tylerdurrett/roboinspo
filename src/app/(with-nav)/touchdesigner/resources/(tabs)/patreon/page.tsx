import { Metadata } from 'next'
import { getResourcesWithRelations } from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'

export const metadata: Metadata = {
  title: 'Patreon Resources | TouchDesigner | Generative Learning',
  description:
    'Curated Patreon creators offering TouchDesigner tutorials and content.',
}

export default function PatreonResourcesPage() {
  const resources = getResourcesWithRelations().filter(
    (r) => r.sourceType === 'patreon'
  )

  return <ResourcesFilteredView resources={resources} fixedSourceType="patreon" />
}
