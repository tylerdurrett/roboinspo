'use client'

import { ensureGsapRegistered } from '@/lib/gsap/register'

export type AnimationInit = (ctx: {
  scope: HTMLElement | Document
}) => () => void

export const initStretch: AnimationInit = ({ scope }) => {
  const { gsap } = ensureGsapRegistered()

  const root: Document | HTMLElement =
    scope instanceof Document ? document : scope

  const elements = Array.from(
    root.querySelectorAll<HTMLElement>('[data-animate="stretch"]')
  )

  const kills: Array<() => void> = []

  elements.forEach((el) => {
    const parsedDuration = parseFloat(el.dataset.duration ?? '')
    const duration = Number.isFinite(parsedDuration) ? parsedDuration : 0.8
    const parsedDelay = parseFloat(el.dataset.delay ?? '')
    const delay = Number.isFinite(parsedDelay) ? parsedDelay : 0
    const parsedStretch = parseFloat(el.dataset.stretch ?? '')
    const stretch = Number.isFinite(parsedStretch) ? parsedStretch : 300

    const tween = gsap.fromTo(
      el,
      { fontStretch: '100%' },
      {
        fontStretch: `${stretch}%`,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )

    kills.push(() => {
      tween?.kill?.()
    })
  })

  return () => {
    kills.forEach((kill) => kill())
  }
}
