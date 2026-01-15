import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCreators,
  getCreatorBySlug,
  getResourcesByCreator,
  resolveCreators,
  resolveOrganization,
} from '@/lib/td-resources'
import { CreatorDetail } from '@/components/td-resources/CreatorDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const creators = getCreators()
  return creators.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const creator = getCreatorBySlug(slug)

  if (!creator) {
    return { title: 'Not Found' }
  }

  return {
    title: `${creator.name} | TouchDesigner Creators | Generative Learning`,
    description: creator.bio ?? `TouchDesigner resources by ${creator.name}`,
  }
}

export default async function CreatorDetailPage({ params }: Props) {
  const { slug } = await params
  const creator = getCreatorBySlug(slug)

  if (!creator) {
    notFound()
  }

  // Get resources with relations for this creator
  const resourcesRaw = getResourcesByCreator(slug)
  const resources = resourcesRaw.map((r) => ({
    ...r,
    creators: resolveCreators(r),
    organization: resolveOrganization(r),
  }))

  return <CreatorDetail creator={creator} resources={resources} />
}
