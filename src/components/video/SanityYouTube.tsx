import React from 'react'

type Props = {
  value: {
    url?: string | null
  }
}

// Simple YouTube embed using the iframe player. Avoids extra deps.
export function SanityYouTube({ value }: Props) {
  const url = value?.url ?? ''
  if (!url) return null

  // Extract the video ID from typical YouTube URLs
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/
  )
  const videoId = match?.[1]

  if (!videoId) return null

  const src = `https://www.youtube.com/embed/${videoId}`

  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={src}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}

export default SanityYouTube
