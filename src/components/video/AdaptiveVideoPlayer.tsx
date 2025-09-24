'use client'

import { useState, useCallback } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import type { MuxPlayerProps } from '@mux/mux-player-react'

interface AdaptiveVideoPlayerProps extends MuxPlayerProps {
  className?: string
  containerClassName?: string
}

type AspectRatioType = 'vertical' | 'square' | 'horizontal' | 'loading'

export function AdaptiveVideoPlayer({
  className,
  containerClassName,
  style,
  ...muxPlayerProps
}: AdaptiveVideoPlayerProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9) // Default to 16:9
  const [aspectRatioType, setAspectRatioType] =
    useState<AspectRatioType>('loading')

  const handlePlayerRef = useCallback(
    (
      muxPlayerEl:
        | (HTMLElement & { media?: { nativeEl?: HTMLVideoElement } })
        | null
    ) => {
      if (!muxPlayerEl) return

      const nativeVideoEl = muxPlayerEl.media?.nativeEl
      if (!nativeVideoEl) return

      const handleLoadedMetadata = () => {
        const { videoWidth, videoHeight } = nativeVideoEl

        if (videoWidth > 0 && videoHeight > 0) {
          const ratio = videoWidth / videoHeight
          setAspectRatio(ratio)

          // Categorize aspect ratio
          if (ratio < 0.8) {
            setAspectRatioType('vertical')
          } else if (ratio >= 0.8 && ratio <= 1.2) {
            setAspectRatioType('square')
          } else {
            setAspectRatioType('horizontal')
          }
        }
      }

      // Check if metadata is already loaded
      if (nativeVideoEl.readyState >= 1) {
        handleLoadedMetadata()
      } else {
        nativeVideoEl.addEventListener('loadedmetadata', handleLoadedMetadata)
      }

      // Cleanup function
      return () => {
        nativeVideoEl.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        )
      }
    },
    []
  )

  const getAspectRatioClasses = () => {
    switch (aspectRatioType) {
      case 'vertical':
        return 'max-w-md mx-auto' // Constrain width for vertical videos
      case 'square':
        return 'aspect-square max-w-lg mx-auto'
      case 'horizontal':
        return 'aspect-video'
      case 'loading':
      default:
        return 'aspect-video' // Default while loading
    }
  }

  const containerStyle = {
    aspectRatio: aspectRatioType === 'loading' ? '16/9' : `${aspectRatio}`,
    ...style,
  }

  return (
    <div
      className={`${getAspectRatioClasses()} overflow-hidden rounded-lg ${containerClassName || ''}`}
    >
      <MuxPlayer
        ref={handlePlayerRef}
        className={`w-full h-full ${className || ''}`}
        style={containerStyle}
        {...muxPlayerProps}
      />
    </div>
  )
}
