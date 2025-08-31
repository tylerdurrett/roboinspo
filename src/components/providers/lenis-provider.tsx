'use client'

import { useEffect, useRef, type PropsWithChildren } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function LenisProvider({ children }: PropsWithChildren) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      // tuned for smooth yet responsive feel
      lerp: 0.1,
    })
    lenisRef.current = lenis

    // Keep ScrollTrigger in sync with Lenis
    const onLenisScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onLenisScroll)

    // Drive Lenis with GSAP's ticker for consistent timing
    const gsapTicker = (time: number) => {
      // GSAP time is seconds; Lenis expects ms
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(gsapTicker)
    gsap.ticker.lagSmoothing(0)

    // Initial refresh once everything is wired up
    ScrollTrigger.refresh()

    return () => {
      lenis.off('scroll', onLenisScroll)
      gsap.ticker.remove(gsapTicker)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return children
}
