import { ResourcesTabNav } from '@/components/td-resources/ResourcesTabNav'

export default function ResourcesTabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-16 px-4 sm:px-8 md:px-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TouchDesigner Resources</h1>
        <p className="text-muted-foreground">
          A curated collection of tutorials, courses, and learning materials for
          TouchDesigner.
        </p>
      </div>

      <ResourcesTabNav />

      <div className="mt-6">{children}</div>
    </div>
  )
}
