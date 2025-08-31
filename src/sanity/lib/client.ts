import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'
import { getFile as getFileFromAssetUtils } from '@sanity/asset-utils'
import type { SanityFileSource } from '@sanity/asset-utils'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

export const getFile = (source: SanityFileSource) => {
  return getFileFromAssetUtils(source, {
    projectId,
    dataset,
  })
}
