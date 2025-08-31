import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

type SanityImageProps = {
  value: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
}

export function SanityImage({ value }: SanityImageProps) {
  if (!value?.asset) {
    return null
  }
  const isAnimatedGif = value.asset._ref.endsWith('-gif')

  let imageBuilder = urlFor(value)
  if (!isAnimatedGif) {
    imageBuilder = imageBuilder?.width(800)?.auto('format')
  }
  const imageUrl = imageBuilder?.url()
  const alt = value.alt || 'Blog post image'

  if (!imageUrl) {
    return null
  }

  return (
    <div className="my-6">
      <Image
        src={imageUrl}
        alt={alt}
        width={800}
        height={450}
        className="rounded-lg"
        unoptimized={isAnimatedGif}
      />
    </div>
  )
}
