import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Generative Learning',
}

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-[2vh] items-center justify-center">
        <Link
          href="/reading"
          className="text-[8vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          READING LIST
        </Link>
        <Link
          href="/creative-coding/resources"
          className="text-[8vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          CREATIVE CODING
        </Link>
        <Link
          href="/agentic-systems/resources"
          className="text-[8vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          AGENTIC SYSTEMS
        </Link>
      </div>
    </div>
  )
}
