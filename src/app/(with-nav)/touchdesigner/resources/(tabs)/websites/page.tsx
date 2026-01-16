import { Suspense } from 'react'
import { Metadata } from 'next'
import {
  getResourcesWithRelations,
  getSourceTypesForCategory,
} from '@/lib/td-resources'
import { ResourcesFilteredView } from '@/components/td-resources/ResourcesFilteredView'

export const metadata: Metadata = {
  title: 'Website Resources | TouchDesigner | Generative Learning',
  description:
    'Curated websites, blogs, courses, forums, and other web resources with TouchDesigner learning content.',
}

export default function WebsitesResourcesPage() {
  const websiteSourceTypes = getSourceTypesForCategory('websites')
  const resources = getResourcesWithRelations().filter((r) =>
    websiteSourceTypes.includes(r.sourceType)
  )

  return (
    <Suspense>
      <ResourcesFilteredView
        resources={resources}
        fixedSourceTypes={websiteSourceTypes}
      />
    </Suspense>
  )
}
