'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './LineRevealer.module.css'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

type LineRevealerProps = {
  lines: string[]
  className?: string
  strokeWidth?: number | string
  /** Stroke width for the revealed text overlay */
  revealedStrokeWidth?: number | string
  /** Outline color for the unrevealed text */
  initialOutlineColor?: string
  /** Text color for the unrevealed (outlined) text */
  initialColor?: string
  /** Fill color for the revealed text */
  revealedColor?: string
  /**
   * Outline color applied to the revealed fill text only. This lets you
   * mask the underlying outline after reveal to better blend with the
   * background (e.g., purple section). Defaults to the page background.
   */
  revealedOutlineColor?: string
  /** Desktop start/end; mobile values adjust automatically */
  start?: string
  end?: string
  /**
   * When true, do not inline CSS variables via the style prop so that
   * responsive Tailwind arbitrary properties can control them instead.
   */
  preferCssVars?: boolean
}

export default function LineRevealer({
  lines,
  className,
  strokeWidth = 2,
  revealedStrokeWidth = 3,
  initialOutlineColor = 'white',
  initialColor = 'transparent',
  revealedColor = 'var(--color-yellow)',
  revealedOutlineColor = 'var(--background)',
  start = 'top 80%',
  end = 'bottom 65%',
  preferCssVars = false,
}: LineRevealerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const masks = gsap.utils.toArray<HTMLElement>('[data-mask]')

      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const s = isMobile ? 'top 45%' : start
      const e = isMobile ? 'bottom 45%' : end

      // Ensure all masks start hidden using clip-path so layout doesn't reflow
      gsap.set(masks, { clipPath: 'inset(0% 100% 0% 0%)' })

      // Use a single scrubbed timeline so lines reveal sequentially
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: s,
          end: e,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      masks.forEach((mask) => {
        tl.to(mask, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
      })
    }, root)

    // refresh once wired
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => ctx.revert()
  }, [start, end])

  const styleVars = useMemo(() => {
    const sw =
      typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth
    const rsw =
      typeof revealedStrokeWidth === 'number'
        ? `${revealedStrokeWidth}px`
        : revealedStrokeWidth
    return {
      '--stroke-width': sw,
      '--initial-outline-color': initialOutlineColor,
      '--initial-color': initialColor,
      '--revealed-color': revealedColor,
      '--revealed-outline-color': revealedOutlineColor,
      '--revealed-stroke-width': rsw,
    } as React.CSSProperties & {
      '--stroke-width': string
      '--initial-outline-color': string
      '--initial-color': string
      '--revealed-color': string
      '--revealed-outline-color': string
      '--revealed-stroke-width': string
    }
  }, [
    strokeWidth,
    revealedStrokeWidth,
    initialOutlineColor,
    initialColor,
    revealedColor,
    revealedOutlineColor,
  ])

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      style={preferCssVars ? undefined : styleVars}
    >
      {lines.map((text, i) => (
        <div className={styles.line} key={i}>
          <p className={styles.textOutline} aria-hidden>
            {text}
          </p>
          <div className={styles.maskWrap} data-mask>
            <p className={styles.textFill} aria-hidden>
              {text}
            </p>
          </div>
        </div>
      ))}
      {/* Hidden accessible content */}
      <span className="sr-only">{lines.join(' ')}</span>
    </div>
  )
}
