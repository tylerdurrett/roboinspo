'use client'

import { ensureGsapRegistered } from '@/lib/gsap/register'
import type { AnimationInit } from '@/lib/gsap/animations'

export const initFadeUp: AnimationInit = ({ scope }) => {
  const { gsap } = ensureGsapRegistered()

  const scopeEl = scope instanceof Document ? undefined : scope

  const ctx = gsap.context(() => {
    const fadeUpEls = gsap.utils.toArray<HTMLElement>(
      '[data-animate="fade-up"]'
    )
    fadeUpEls.forEach((el) => {
      gsap.from(el, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  }, scopeEl)

  return () => {
    ctx.revert()
  }
}
