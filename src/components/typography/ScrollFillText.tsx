'use client'

import { forwardRef, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ScrollFillText.module.css'
import { cn } from '@/lib/utils'

type ScrollFillTextProps = {
  children: React.ReactNode
  className?: string
  /**
   * The total scroll distance per line, in viewport heights.
   * Defaults to 0.75 for a snappy, readable reveal.
   */
  scrollFactor?: number
  /** Stroke width for the outline text. Defaults to 2px. */
  strokeWidth?: number | string
  /** Outline color. Defaults to currentColor. */
  outlineColor?: string
  /** Fill color. Defaults to theme yellow variable. */
  fillColor?: string
  /** Optional start offset for each line's ScrollTrigger, e.g. 'top 80%' */
  start?: string
}

/**
 * Displays large outlined text that fills from left to right as the user scrolls.
 * Uses a dual-layer approach for excellent performance: one outline layer + one masked fill layer.
 */
export const ScrollFillText = forwardRef<HTMLDivElement, ScrollFillTextProps>(
  (
    {
      children,
      className,
      scrollFactor = 0.75,
      strokeWidth = 2,
      outlineColor = 'currentColor',
      fillColor = 'var(--color-yellow)',
      start = 'top 90%',
    },
    ref
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const overlayRef = useRef<HTMLDivElement | null>(null)
    const outlineRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        const overlayEl = overlayRef.current
        const outlineEl = outlineRef.current
        if (!overlayEl || !outlineEl) return

        // Build word spans once from the outline's text content
        if (overlayEl.childNodes.length === 0) {
          const text = outlineEl.textContent || ''
          const tokens = text.match(/\n|\S+|\s+/g) || []
          let lastWord: HTMLSpanElement | null = null
          tokens.forEach((tok) => {
            if (tok === '\n') {
              // Treat explicit newlines as spaces (browser will reflow lines naturally)
              if (lastWord) lastWord.appendChild(document.createTextNode(' '))
              return
            }
            if (/^\s+$/.test(tok)) {
              // Attach whitespace to previous word so it travels with the word during line grouping
              if (lastWord) lastWord.appendChild(document.createTextNode(tok))
              return
            }
            const w = document.createElement('span')
            w.className = 'word'
            w.textContent = tok
            overlayEl.appendChild(w)
            lastWord = w
          })
        }

        const splitIntoLines = () => {
          // Flatten previous lines if any
          const existingLines = Array.from(
            overlayEl.querySelectorAll(`.${styles.line}`)
          )
          existingLines.forEach((line) => {
            while (line.firstChild) {
              overlayEl.insertBefore(line.firstChild, line)
            }
            line.remove()
          })

          const words = Array.from(
            overlayEl.querySelectorAll<HTMLElement>('.word')
          )

          // Read positions BEFORE mutating DOM so we don't invalidate measurements mid-loop
          const positions = words.map((w) => w.offsetTop)

          let currentTop: number | null = null
          let lineEl: HTMLSpanElement | null = null
          words.forEach((word, idx) => {
            const top = positions[idx]
            if (currentTop === null || Math.abs(top - currentTop) > 2) {
              lineEl = document.createElement('span')
              lineEl.className = styles.line
              lineEl.setAttribute('data-line', '')
              overlayEl.insertBefore(lineEl, word)
              currentTop = top
            }
            lineEl!.appendChild(word)
          })
        }

        const createAnimations = () => {
          const lines = Array.from(
            overlayEl.querySelectorAll<HTMLElement>('[data-line]')
          )
          lines.forEach((line, i) => {
            gsap.set(line, { clipPath: 'inset(0% 100% 0% 0%)' })
            gsap.to(line, {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: {
                trigger: line,
                start,
                end: `+=${Math.max(0.2, scrollFactor) * window.innerHeight}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
              delay: i * 0.02,
            })
          })
        }

        splitIntoLines()
        createAnimations()

        const handleRefresh = () => {
          // Kill triggers belonging to our overlay
          ScrollTrigger.getAll().forEach((t) => {
            const trg = t.vars.trigger as Element | undefined
            if (trg && overlayEl.contains(trg)) t.kill()
          })
          splitIntoLines()
          createAnimations()
        }

        ScrollTrigger.addEventListener('refreshInit', handleRefresh)
        window.addEventListener('resize', handleRefresh)

        return () => {
          ScrollTrigger.removeEventListener('refreshInit', handleRefresh)
          window.removeEventListener('resize', handleRefresh)
        }
      }, rootRef)

      return () => ctx.revert()
    }, [start, scrollFactor])

    return (
      <div
        ref={(node) => {
          rootRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node
        }}
        className={cn(styles.root, className)}
        style={{
          ...(typeof strokeWidth === 'number'
            ? ({ '--stroke-width': `${strokeWidth}px` } as React.CSSProperties &
                Record<string, string>)
            : ({ '--stroke-width': strokeWidth } as React.CSSProperties &
                Record<string, string>)),
          ...({ '--outline-color': outlineColor } as React.CSSProperties &
            Record<string, string>),
          ...({ '--fill-color': fillColor } as React.CSSProperties &
            Record<string, string>),
        }}
      >
        {/* Outline layer (stroke visible immediately) */}
        <div ref={outlineRef} className={styles.outline} aria-hidden>
          {children}
        </div>
        {/* Overlay filled content; words and line wrappers built at runtime */}
        <div
          ref={overlayRef}
          className={styles.overlay + ' ' + styles.fill}
          aria-hidden
        />
        {/* Accessible text for screen readers only */}
        <span className="sr-only">{children}</span>
      </div>
    )
  }
)

ScrollFillText.displayName = 'ScrollFillText'

export default ScrollFillText
