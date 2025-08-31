'use client'

import { useLayoutEffect } from 'react'
import type { RefObject, DependencyList } from 'react'
import { ensureGsapRegistered } from '@/lib/gsap/register'
import {
  baseAnimations,
  type BaseAnimationId,
  type AnimationInit,
  DEFAULT_ANIMATIONS,
} from '@/lib/gsap/animations'

type UseAnimationsOptions<CustomKeys extends string = never> = {
  scopeRef?: RefObject<HTMLElement | null>
  animations?: Array<BaseAnimationId | CustomKeys>
  custom?: Record<CustomKeys, AnimationInit>
  inlineInits?: Array<AnimationInit>
  deps?: DependencyList
}

export function useAnimations<CustomKeys extends string = never>(
  options: UseAnimationsOptions<CustomKeys> = {}
) {
  const { scopeRef, animations, custom, inlineInits, deps = [] } = options

  useLayoutEffect(() => {
    // Ensure GSAP is ready (client side)
    ensureGsapRegistered()

    const scope: HTMLElement | Document = scopeRef?.current ?? document

    const mergedRegistry: Record<string, AnimationInit> = {
      ...baseAnimations,
      ...(custom ?? {}),
    }

    const selectedIds: string[] =
      animations && animations.length
        ? animations
        : (DEFAULT_ANIMATIONS as Array<BaseAnimationId>)

    const disposers: Array<() => void> = []

    selectedIds.forEach((id) => {
      const init = mergedRegistry[id]
      if (init) {
        const dispose = init({ scope })
        disposers.push(dispose)
      }
    })

    if (inlineInits && inlineInits.length) {
      inlineInits.forEach((init) => {
        const dispose = init({ scope })
        disposers.push(dispose)
      })
    }

    return () => {
      disposers.forEach((dispose) => dispose())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef, animations, custom, inlineInits, ...deps])
}
