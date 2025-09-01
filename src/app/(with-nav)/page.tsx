import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Robo Inspo | Slop Review',
}

export default function Home() {
  return (
    <div className="w-screen h-screen relative">
      <Image
        src="/static/opengraph.jpg"
        alt="Robo Inspo"
        fill
        className="object-fill"
      />
    </div>
  )
}
