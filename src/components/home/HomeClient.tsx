'use client'

import { useState } from 'react'
import TextFillBlock from './TextFillBlock'

interface BlockConfig {
  text: string
  label: string
  href: string
  videoPlaybackIds: string[]
}

const BLOCKS: BlockConfig[] = [
  {
    text: 'READINGLIST',
    label: 'Reading List',
    href: '/reading',
    videoPlaybackIds: ['penMkr9zNyYGXc5GjcJnHTqtMUBn8N901l3SfO8Rp01Os'],
  },
  {
    text: 'CREATIVECODING',
    label: 'Creative Coding',
    href: '/creative-coding/resources',
    videoPlaybackIds: [
      // '45Fj9902Qepq02JDMAcXojiXF7ilTZb1NxjFmkKafppqA',
      'LuwmQgGmPIcLLTc01tTgUX65Miefb5SPhtUVEYibZblk',
    ],
  },
  {
    text: 'AGENTICSYSTEMS',
    label: 'Agentic Systems',
    href: '/agentic-systems/resources',
    videoPlaybackIds: [
      // 'M8AbkflI02D7FIHsz8DjXheLOPU8IhWjXepzG00httyC4',
      'vSr45xWBsnpKHWs5hV2rL2O2OpxwJrxLDmn301vlgNFs',
    ],
  },
]

export default function HomeClient() {
  const [selectedIds] = useState(() =>
    BLOCKS.map(
      (b) =>
        b.videoPlaybackIds[
          Math.floor(Math.random() * b.videoPlaybackIds.length)
        ]
    )
  )

  return (
    <div className="h-dvh w-dvw flex landscape:flex-row portrait:flex-col overflow-hidden">
      {BLOCKS.map((block, i) => (
        <TextFillBlock
          key={block.text}
          text={block.text}
          label={block.label}
          href={block.href}
          videoPlaybackId={selectedIds[i]}
          className="landscape:w-1/3 landscape:h-full portrait:w-full portrait:h-1/3"
        />
      ))}
    </div>
  )
}
