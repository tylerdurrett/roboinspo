import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Generative Learning',
}

export default function Home() {
  return (
    <div className="h-dvh w-dvw flex items-center justify-center overflow-hidden">
      <div className="flex flex-col gap-[min(2vh,1rem)] items-center justify-center px-4">
        <Link
          href="/reading"
          className="text-[min(8vw,22vh)] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          READING LIST
        </Link>
        <Link
          href="/creative-coding/resources"
          className="text-[min(8vw,22vh)] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          CREATIVE CODING
        </Link>
        <Link
          href="/agentic-systems/resources"
          className="text-[min(8vw,22vh)] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          AGENTIC SYSTEMS
        </Link>
      </div>
    </div>
  )
}
