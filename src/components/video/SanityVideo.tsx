import MuxPlayer from '@mux/mux-player-react'

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
      <MuxPlayer
        playbackId={value.asset.playbackId}
        metadata={{
          video_id: value.asset._id,
        }}
        className="aspect-video rounded-xl"
        streamType="on-demand"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}
