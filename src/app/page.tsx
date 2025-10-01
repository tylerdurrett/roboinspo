import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Robo Inspo | Slop Review',
}

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-[2vh] items-center justify-center">
        <Link
          href="/oldthings"
          className="text-[12vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          THINGS
        </Link>
        <Link
          href="/reading"
          className="text-[12vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          READING
        </Link>
      </div>
    </div>
  )
}
