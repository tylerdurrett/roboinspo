import { Callout } from '@/components/Callout'
import { SanityFile } from '@/components/SanityFile'
import { SanityImage } from '@/components/SanityImage'
import { SanityTable } from '@/components/SanityTable'
import { SanityVideo } from '@/components/video/SanityVideo'
import { SanityYouTube } from '@/components/video/SanityYouTube'
import type { PortableTextComponents } from 'next-sanity'

export const portableTextComponents: PortableTextComponents = {
  types: {
    callout: Callout,
    image: SanityImage,
    'mux.video': SanityVideo,
    youtube: SanityYouTube,
    fileBlock: SanityFile,
    table: SanityTable,
  },
}
