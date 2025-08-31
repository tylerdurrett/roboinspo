'use client'

import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './FxLayer.css'

export type Spot = {
  id?: string
  x: string
  y: string
  r: string
  oklch: string
  a?: number
  parallax?: number
  sm?: Partial<Pick<Spot, 'x' | 'y' | 'r'>>
  anchor?: string
  anchorOffset?: number
}

export type Gradient = {
  id?: string
  x: string
  y: string
  w: string
  h: string
  rotate?: string
  opacity?: number
  parallax?: number
  /** Any valid CSS gradient, e.g. `radial-gradient(...)`, `linear-gradient(...)`, `conic-gradient(...)` */
  gradient: string
  /** Optional background-size override (defaults to `100% 100%`) */
  backgroundSize?: string
  sm?: Partial<
    Pick<
      Gradient,
      'x' | 'y' | 'w' | 'h' | 'rotate' | 'opacity' | 'backgroundSize'
    >
  >
  anchor?: string
  anchorOffset?: number
}

export type Ornament = {
  id?: string
  x: string
  y: string
  w: string
  rotate?: string
  color?: string
  opacity?: number
  parallax?: number
  svg: ReactNode
  sm?: Partial<Pick<Ornament, 'x' | 'y' | 'w' | 'rotate' | 'opacity'>>
  anchor?: string
  anchorOffset?: number
}

export function FxLayer({
  spots = [],
  gradients = [],
  ornaments = [],
  enableParallax = true,
}: {
  spots?: Spot[]
  gradients?: Gradient[]
  ornaments?: Ornament[]
  enableParallax?: boolean
}) {
  const layerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const measureAnchors = () => {
        const all =
          layerRef.current?.querySelectorAll<HTMLElement>('[data-anchor]')
        all?.forEach((node) => {
          const sel = node.dataset.anchor
          if (!sel) return
          const el = document.querySelector<HTMLElement>(sel)
          if (!el) return
          const rect = el.getBoundingClientRect()
          const scrollY = window.scrollY || window.pageYOffset
          const y = rect.top + scrollY + Number(node.dataset.anchorOffset || 0)
          node.style.setProperty('--y', y + 'px')
        })
      }

      measureAnchors()
      ScrollTrigger.addEventListener('refresh', measureAnchors)
      window.addEventListener('resize', measureAnchors)

      if (enableParallax) {
        const parallaxNodes = gsap.utils.toArray<HTMLElement>('[data-parallax]')
        parallaxNodes.forEach((node) => {
          const speed = Number(node.dataset.parallax || 0)
          gsap.to(node, {
            y: () => speed * 120,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        })
      }
    }, layerRef)

    return () => ctx.revert()
  }, [enableParallax])

  const isSmall = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 900px)').matches,
    []
  )

  return (
    <div ref={layerRef} className="fx-layer">
      <div className="fx-bg" aria-hidden />
      {gradients.map((g, i) => {
        const x = isSmall && g.sm?.x ? g.sm.x : g.x
        const y = isSmall && g.sm?.y ? g.sm.y : g.y
        const w = isSmall && g.sm?.w ? g.sm.w : g.w
        const h = isSmall && g.sm?.h ? g.sm.h : g.h
        const rotate =
          isSmall && g.sm?.rotate ? g.sm.rotate : (g.rotate ?? '0deg')
        const opacity =
          isSmall && g.sm?.opacity !== undefined
            ? g.sm.opacity
            : (g.opacity ?? 1)
        const backgroundSize =
          (isSmall && g.sm?.backgroundSize) || g.backgroundSize || '100% 100%'
        return (
          <span
            key={g.id || `grad-${i}`}
            className="fx-gradient"
            style={
              {
                '--x': x,
                '--y': y,
                '--w': w,
                '--h': h,
                transform: `rotate(${rotate})`,
                opacity,
                backgroundImage: g.gradient,
                backgroundSize,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              } as React.CSSProperties & Record<string, string | number>
            }
            data-parallax={g.parallax ?? undefined}
            data-anchor={g.anchor ?? undefined}
            data-anchor-offset={g.anchorOffset ?? undefined}
            aria-hidden
          />
        )
      })}
      {spots.map((s, i) => {
        const x = isSmall && s.sm?.x ? s.sm.x : s.x
        const y = isSmall && s.sm?.y ? s.sm.y : s.y
        const r = isSmall && s.sm?.r ? s.sm.r : s.r
        return (
          <span
            key={s.id || `spot-${i}`}
            className="fx-spot"
            style={
              {
                '--x': x,
                '--y': y,
                '--r': r,
                '--oklch': s.oklch,
                '--a': s.a ?? 0.3,
              } as React.CSSProperties & Record<string, string | number>
            }
            data-parallax={s.parallax ?? undefined}
            data-anchor={s.anchor ?? undefined}
            data-anchor-offset={s.anchorOffset ?? undefined}
            aria-hidden
          />
        )
      })}

      {ornaments.map((o, i) => {
        const x = isSmall && o.sm?.x ? o.sm.x : o.x
        const y = isSmall && o.sm?.y ? o.sm.y : o.y
        const w = isSmall && o.sm?.w ? o.sm.w : o.w
        const rotate =
          isSmall && o.sm?.rotate ? o.sm.rotate : (o.rotate ?? '0deg')
        const opacity =
          isSmall && o.sm?.opacity !== undefined
            ? o.sm.opacity
            : (o.opacity ?? 1)
        return (
          <div
            key={o.id || `orn-${i}`}
            className="fx-ornament"
            style={{
              left: x,
              top: y,
              width: w,
              transform: `rotate(${rotate})`,
              opacity,
              color: o.color ?? 'currentColor',
            }}
            data-parallax={o.parallax ?? undefined}
            data-anchor={o.anchor ?? undefined}
            data-anchor-offset={o.anchorOffset ?? undefined}
            aria-hidden
          >
            {o.svg}
          </div>
        )
      })}
    </div>
  )
}

export default FxLayer
