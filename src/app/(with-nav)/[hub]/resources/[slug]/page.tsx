import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getResourceWithRelations,
  getResourcesByHub,
  hubs,
} from '@/lib/td-resources'
import { ResourceDetail } from '@/components/td-resources/ResourceDetail'
import { isValidHub, getHubConfig } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface Props {
  params: Promise<{ hub: string; slug: string }>
}

export async function generateStaticParams() {
  const params: { hub: string; slug: string }[] = []
  for (const hub of hubs) {
    const resources = getResourcesByHub(hub)
    for (const resource of resources) {
      params.push({ hub, slug: resource.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub, slug } = await params

  if (!isValidHub(hub)) {
    return { title: 'Not Found' }
  }

  const resource = getResourceWithRelations(slug)
  if (!resource) {
    return { title: 'Not Found' }
  }

  const config = getHubConfig(hub)
  return {
    title: `${resource.title} | ${config.name} Resources`,
    description: resource.description,
  }
}

export default async function HubResourceDetailPage({ params }: Props) {
  const { hub, slug } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const hubSlug = hub as Hub
  const resource = getResourceWithRelations(slug)

  if (!resource) {
    notFound()
  }

  // Verify resource belongs to this hub
  if (!resource.hubs.includes(hubSlug)) {
    notFound()
  }

  return <ResourceDetail resource={resource} hubSlug={hubSlug} />
}
