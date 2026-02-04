import { Metadata } from 'next'
import HomeClient from '@/components/home/HomeClient'

export const metadata: Metadata = {
  title: 'Generative Learning',
}

export default function Home() {
  return <HomeClient />
}
