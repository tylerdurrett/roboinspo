'use client'

import { useState, useEffect, useCallback, useRef, type RefObject } from 'react'
import { measureCharacters } from '@/lib/text-fill/measure'
import { computeLayout } from '@/lib/text-fill/layout'
import type { CharMetrics, BlockLayout } from '@/lib/text-fill/types'

interface UseTextFillLayoutOptions {
  text: string
  containerRef: RefObject<HTMLElement | null>
  fontFamily: string
  debounceMs?: number
}

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
