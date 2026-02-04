'use client'

import TextFillBlock from './TextFillBlock'

interface BlockConfig {
  text: string
  label: string
  href: string
}

const BLOCKS: BlockConfig[] = [
  { text: 'READINGLIST', label: 'Reading List', href: '/reading' },
  {
    text: 'CREATIVECODING',
    label: 'Creative Coding',
    href: '/creative-coding/resources',
  },
  {
    text: 'AGENTICSYSTEMS',
    label: 'Agentic Systems',
    href: '/agentic-systems/resources',
  },
]

export default function HomeClient() {
  return (
    <div className="h-dvh w-dvw flex landscape:flex-row portrait:flex-col gap-1 overflow-hidden">
      {BLOCKS.map((block) => (
        <TextFillBlock
          key={block.text}
          text={block.text}
          label={block.label}
          href={block.href}
          className="landscape:w-1/3 landscape:h-full portrait:w-full portrait:h-1/3"
        />
      ))}
    </div>
  )
}
