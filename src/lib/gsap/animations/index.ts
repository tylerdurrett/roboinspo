'use client'

import { initStretch, type AnimationInit } from '@/lib/gsap/animations/stretch'
import { initRevealOnLoad } from '@/lib/gsap/animations/revealOnLoad'
import { initFadeUp } from '@/lib/gsap/animations/fadeUp'

export type BaseAnimationId = 'stretch' | 'revealOnLoad' | 'fadeUp'

export const baseAnimations: Record<BaseAnimationId, AnimationInit> = {
  stretch: initStretch,
  revealOnLoad: initRevealOnLoad,
  fadeUp: initFadeUp,
}

export type { AnimationInit } from '@/lib/gsap/animations/stretch'

export const DEFAULT_ANIMATIONS: ReadonlyArray<BaseAnimationId> = ['stretch']
