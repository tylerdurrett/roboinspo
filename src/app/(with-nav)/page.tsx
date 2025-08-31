import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Robo Inspo | Slop Review',
}

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <img
        src="/static/opengraph.jpg"
        alt="Robo Inspo"
        className="w-screen h-screen object-fill"
      />
    </div>
  )
}
