import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Robo Inspo | Slop Review',
}

export default function Home() {
  return (
    <div className="w-screen h-screen relative">
      <Link href="/reading">
        <Image
          src="/static/opengraph.jpg"
          alt="Robo Inspo"
          fill
          className="object-fill"
        />
      </Link>
    </div>
  )
}
