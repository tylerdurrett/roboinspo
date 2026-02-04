import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCreatorsByHub,
  getCreatorBySlug,
  getResourcesByCreatorAndHub,
  resolveCreators,
  resolveOrganization,
  hubs,
} from '@/lib/td-resources'
import { CreatorDetail } from '@/components/td-resources/CreatorDetail'
import { isValidHub, getHubConfig } from '@/lib/hubs'
import type { Hub } from '@/lib/td-resources'

interface Props {
  params: Promise<{ hub: string; slug: string }>
}

export async function generateStaticParams() {
  const params: { hub: string; slug: string }[] = []
  for (const hub of hubs) {
    const creators = getCreatorsByHub(hub)
    for (const creator of creators) {
      params.push({ hub, slug: creator.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub, slug } = await params

  if (!isValidHub(hub)) {
    return { title: 'Not Found' }
  }

  const creator = getCreatorBySlug(slug)
  if (!creator) {
    return { title: 'Not Found' }
  }

  const config = getHubConfig(hub)
  return {
    title: `${creator.name} | ${config.name} Creators`,
    description: creator.bio ?? `${config.name} resources by ${creator.name}`,
  }
}

export default async function HubCreatorDetailPage({ params }: Props) {
  const { hub, slug } = await params

  if (!isValidHub(hub)) {
    notFound()
  }

  const hubSlug = hub as Hub
  const creator = getCreatorBySlug(slug)

  if (!creator) {
    notFound()
  }

  // Verify creator belongs to this hub
  if (!creator.hubs.includes(hubSlug)) {
    notFound()
  }

  // Get resources with relations for this creator (hub-filtered)
  const resourcesRaw = getResourcesByCreatorAndHub(slug, hubSlug)
  const resources = resourcesRaw.map((r) => ({
    ...r,
    creators: resolveCreators(r),
    organization: resolveOrganization(r),
  }))

  return <CreatorDetail creator={creator} resources={resources} hubSlug={hubSlug} />
}
