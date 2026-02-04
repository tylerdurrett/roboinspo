'use client'

/**
 * useTextFillLayout Hook
 * ======================
 *
 * React hook that computes a text-fill layout for a container element.
 * The layout fills the container with text where each row is independently
 * scaled to fill the width, and total row heights fill the height exactly.
 *
 * ## Features
 *
 * - **Font Loading**: Waits for the specified font to load before measuring
 * - **Responsive**: Uses ResizeObserver to recalculate on container resize
 * - **Debounced**: Resize recalculations are debounced (default 100ms)
 * - **Cached Metrics**: Character measurements are cached between resizes
 *
 * ## Usage
 *
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const layout = useTextFillLayout({
 *   text: 'HELLOWORLD',
 *   containerRef,
 *   fontFamily: 'league-gothic, sans-serif',
 * })
 *
 * // layout.rows contains the row breaks and font sizes
 * ```
 *
 * ## Font Loading Strategy
 *
 * 1. Wait for document.fonts.ready
 * 2. Check if font is available with document.fonts.check()
 * 3. If not available (Typekit fonts may load later), poll every 50ms
 * 4. Safety timeout after 3 seconds proceeds with fallback font
 */

import { useState, useEffect, useCallback, useRef, type RefObject } from 'react'
import { measureCharacters } from '@/lib/text-fill/measure'
import { computeLayout } from '@/lib/text-fill/layout'
import type { CharMetrics, BlockLayout } from '@/lib/text-fill/types'

interface UseTextFillLayoutOptions {
  /** Text to layout (spaces preserved) */
  text: string
  /** Ref to the container element to fill */
  containerRef: RefObject<HTMLElement | null>
  /** CSS font-family string */
  fontFamily: string
  /** Debounce delay for resize recalculations (ms) */
  debounceMs?: number
}

/**
 * Compute text-fill layout for a container element.
 *
 * @returns BlockLayout with row breaks and font sizes, or null if not ready
 */
export function useTextFillLayout({
  text,
  containerRef,
  fontFamily,
  debounceMs = 100,
}: UseTextFillLayoutOptions): BlockLayout | null {
  const [layout, setLayout] = useState<BlockLayout | null>(null)
  const [fontReady, setFontReady] = useState(false)
  const metricsRef = useRef<CharMetrics | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Wait for the font to load
  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    document.fonts.ready.then(() => {
      if (cancelled) return

      if (document.fonts.check(`100px ${fontFamily}`)) {
        setFontReady(true)
        return
      }

      // Typekit fonts may load after fonts.ready - poll as fallback
      intervalId = setInterval(() => {
        if (document.fonts.check(`100px ${fontFamily}`)) {
          setFontReady(true)
          clearInterval(intervalId)
          clearTimeout(timeoutId)
        }
      }, 50)

      // Safety timeout: proceed with whatever font is available
      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        if (!cancelled) setFontReady(true)
      }, 3000)
    })

    return () => {
      cancelled = true
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [fontFamily])

  const recalculate = useCallback(() => {
    const el = containerRef.current
    if (!el || !fontReady) return

    // Measure characters (cached across recalculations)
    if (!metricsRef.current) {
      metricsRef.current = measureCharacters(text, fontFamily)
    }

    const blockWidth = el.clientWidth
    const blockHeight = el.clientHeight

    if (blockWidth <= 0 || blockHeight <= 0) return

    const newLayout = computeLayout(
      text,
      metricsRef.current,
      blockWidth,
      blockHeight
    )

    setLayout(newLayout)
  }, [text, fontFamily, fontReady, containerRef])

  // Initial calculation + ResizeObserver for recalculation
  useEffect(() => {
    if (!fontReady) return

    // Initial calculation
    recalculate()

    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(recalculate, debounceMs)
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [fontReady, recalculate, debounceMs, containerRef])

  // Invalidate metrics cache when text or font changes
  useEffect(() => {
    metricsRef.current = null
  }, [text, fontFamily])

  return layout
}
