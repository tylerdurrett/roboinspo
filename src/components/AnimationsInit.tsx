'use client'

import type { BaseAnimationId, AnimationInit } from '@/lib/gsap/animations'
import { useAnimations } from '@/hooks/useAnimations'

type Props<CustomKeys extends string = never> = {
  animations?: Array<BaseAnimationId | CustomKeys>
  custom?: Record<CustomKeys, AnimationInit>
  inlineInits?: Array<AnimationInit>
  deps?: ReadonlyArray<unknown>
}

export default function AnimationsInit<CustomKeys extends string = never>(
  props: Props<CustomKeys>
) {
  useAnimations(props)
  return null
}
