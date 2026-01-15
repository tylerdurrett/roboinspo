import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getResourceWithRelations, getResources } from '@/lib/td-resources'
import { ResourceDetail } from '@/components/td-resources/ResourceDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const resources = getResources()
  return resources.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = getResourceWithRelations(slug)

  if (!resource) {
    return { title: 'Not Found' }
  }

  return {
    title: `${resource.title} | TouchDesigner Resources`,
    description: resource.description,
  }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params
  const resource = getResourceWithRelations(slug)

  if (!resource) {
    notFound()
  }

  return <ResourceDetail resource={resource} />
}
