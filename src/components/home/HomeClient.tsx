'use client'

import TextFillBlock from './TextFillBlock'

interface BlockConfig {
  text: string
  label: string
  href: string
  videoPlaybackId: string
}

const BLOCKS: BlockConfig[] = [
  {
    text: 'READINGLIST',
    label: 'Reading List',
    href: '/reading',
    videoPlaybackId: 'lyljqeNOrBWE4k1icNbWEeuAz4VN7VgOxTnKTXGR844',
  },
  {
    text: 'CREATIVECODING',
    label: 'Creative Coding',
    href: '/creative-coding/resources',
    videoPlaybackId: '45Fj9902Qepq02JDMAcXojiXF7ilTZb1NxjFmkKafppqA',
  },
  {
    text: 'AGENTICSYSTEMS',
    label: 'Agentic Systems',
    href: '/agentic-systems/resources',
    videoPlaybackId: 'M8AbkflI02D7FIHsz8DjXheLOPU8IhWjXepzG00httyC4',
  },
]

export default function HomeClient() {
  return (
    <div className="h-dvh w-dvw flex landscape:flex-row portrait:flex-col overflow-hidden">
      {BLOCKS.map((block) => (
        <TextFillBlock
          key={block.text}
          text={block.text}
          label={block.label}
          href={block.href}
          videoPlaybackId={block.videoPlaybackId}
          className="landscape:w-1/3 landscape:h-full portrait:w-full portrait:h-1/3"
        />
      ))}
    </div>
  )
}
