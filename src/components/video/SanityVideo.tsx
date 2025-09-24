import { AdaptiveVideoPlayer } from './AdaptiveVideoPlayer'

type SanityVideoProps = {
  value: {
    asset: {
      _id: string
      playbackId: string
      assetId: string
    }
  }
}

export function SanityVideo({ value }: SanityVideoProps) {
  console.log('value', value)
  if (!value?.asset?.playbackId) {
    return null
  }

  return (
    <div className="my-6">
      <AdaptiveVideoPlayer
        playbackId={value.asset.playbackId}
        metadata={{
          video_id: value.asset._id,
        }}
        streamType="on-demand"
        containerClassName="rounded-xl"
      />
    </div>
  )
}
