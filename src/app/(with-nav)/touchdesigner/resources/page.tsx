import { Metadata } from 'next'
import { getResourcesWithRelations } from '@/lib/td-resources'
import { ResourcesPageClient } from '@/components/td-resources/ResourcesPageClient'

export const metadata: Metadata = {
  title: 'TouchDesigner Resources | Robo Inspo',
  description:
    'A curated database of TouchDesigner tutorials, courses, and learning resources.',
}

export default function TouchDesignerResourcesPage() {
  const resources = getResourcesWithRelations()

  return (
    <div className="py-16 px-4 sm:px-8 md:px-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TouchDesigner Resources</h1>
        <p className="text-muted-foreground">
          A curated collection of tutorials, courses, and learning materials for
          TouchDesigner.
        </p>
      </div>
      <ResourcesPageClient resources={resources} />
    </div>
  )
}
