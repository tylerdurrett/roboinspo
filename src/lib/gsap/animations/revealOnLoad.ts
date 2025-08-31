'use client'

import { ensureGsapRegistered } from '@/lib/gsap/register'
import type { AnimationInit } from '@/lib/gsap/animations'

export const initRevealOnLoad: AnimationInit = ({ scope }) => {
  const { gsap } = ensureGsapRegistered()

  const scopeEl = scope instanceof Document ? undefined : scope

  const ctx = gsap.context(() => {
    gsap.from('.reveal-on-load', {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.08,
    })
  }, scopeEl)

  return () => {
    ctx.revert()
  }
}
