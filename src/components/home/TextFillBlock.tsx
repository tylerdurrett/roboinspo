'use client'

/**
 * TextFillBlock Component
 * =======================
 *
 * A navigational block that fills its container with text, where each row
 * is independently scaled to fill the width and total heights fill the height.
 *
 * ## How It Works
 *
 * 1. **Layout Calculation**: Uses `useTextFillLayout` hook to determine:
 *    - How to break text into rows
 *    - Font size for each row (based on canvas measurements)
 *    - Row heights that sum to container height
 *
 * 2. **Width Correction**: Canvas measurements don't perfectly match DOM rendering.
 *    To achieve pixel-perfect width filling:
 *    - Render text in a hidden measurement container
 *    - Measure actual rendered width of each row
 *    - Calculate scaleX factor: containerWidth / actualWidth
 *    - Apply CSS transform: scaleX(factor) to stretch/compress text
 *
 * 3. **Two-Phase Render**:
 *    - Phase 1: Render hidden measurement spans, compute scale factors
 *    - Phase 2: Render visible scaled content (only after scales computed)
 *
 * ## Video Hover Effect
 *
 * When `videoPlaybackId` is provided, hovering the block reveals a Mux video
 * visible only through the text letterforms using `mix-blend-mode: multiply`:
 * - Mask layer: black background + white text (same layout)
 * - Video layer on top with multiply blend — video shows through white text,
 *   black areas stay black.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTextFillLayout } from '@/hooks/useTextFillLayout'
import type { BlockLayout } from '@/lib/text-fill/types'

const FONT_FAMILY = 'league-gothic, sans-serif'

interface TextRowsProps {
  layout: BlockLayout
  scaleFactors: number[]
  className?: string
}

function TextRows({ layout, scaleFactors, className }: TextRowsProps) {
  return (
    <div className={cn('flex flex-col', className)} aria-hidden="true">
      {layout.rows.map((row, i) => (
        <span
          key={i}
          className="block font-league-gothic uppercase leading-none whitespace-nowrap origin-left"
          style={{
            fontSize: `${row.fontSize}px`,
            lineHeight: `${row.height}px`,
            height: `${row.height}px`,
            transform: `scaleX(${scaleFactors[i]})`,
          }}
        >
          {row.chars}
        </span>
      ))}
    </div>
  )
}

interface TextFillBlockProps {
  /** Text to display (spaces will be preserved, shown character-by-character) */
  text: string
  /** Accessible label for the link */
  label: string
  /** Navigation destination */
  href: string
  /** Mux playback ID for the hover video effect */
  videoPlaybackId?: string
  /** Called once when the block has finished computing its layout */
  onReady?: () => void
  /** Additional CSS classes */
  className?: string
}

export default function TextFillBlock({
  text,
  label,
  href,
  videoPlaybackId,
  onReady,
  className,
}: TextFillBlockProps) {
  const containerRef = useRef<HTMLAnchorElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scaleFactors, setScaleFactors] = useState<number[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const layout = useTextFillLayout({
    text,
    containerRef,
    fontFamily: FONT_FAMILY,
  })

  const showVideo = videoPlaybackId && !prefersReducedMotion

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }, [])

  // Measure text widths using hidden element and compute scale factors
  const computeScales = useCallback(() => {
    if (!layout || !containerRef.current || !measureRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const measureContainer = measureRef.current
    const spans = measureContainer.querySelectorAll('span')

    const scales: number[] = []
    spans.forEach((span) => {
      const naturalWidth = span.offsetWidth
      if (naturalWidth > 0) {
        scales.push(containerWidth / naturalWidth)
      } else {
        scales.push(1)
      }
    })

    setScaleFactors(scales)
  }, [layout])

  useEffect(() => {
    if (layout) {
      // Wait for hidden measurement element to render
      requestAnimationFrame(() => {
        computeScales()
      })
    }
  }, [layout, computeScales])

  const isReady = layout && scaleFactors.length === layout.rows.length

  useEffect(() => {
    if (isReady) onReady?.()
  }, [isReady, onReady])

  return (
    <Link
      ref={containerRef}
      href={href}
      className={cn(
        'group relative block overflow-hidden',
        !showVideo && 'hover:opacity-70 transition-opacity duration-300',
        !layout && 'invisible',
        className
      )}
      aria-label={label}
    >
      {/* Hidden measurement container */}
      {layout && (
        <div
          ref={measureRef}
          className="absolute opacity-0 pointer-events-none"
          style={{ left: '-9999px', top: 0 }}
          aria-hidden="true"
        >
          {layout.rows.map((row, i) => (
            <span
              key={i}
              className="block font-league-gothic uppercase leading-none whitespace-nowrap"
              style={{
                fontSize: `${row.fontSize}px`,
                width: 'max-content',
              }}
            >
              {row.chars}
            </span>
          ))}
        </div>
      )}

      {/* Visible scaled content */}
      {isReady && <TextRows layout={layout} scaleFactors={scaleFactors} />}

      {/* Video overlay — visible on hover through text letterforms */}
      {isReady && showVideo && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ isolation: 'isolate' }}
          aria-hidden="true"
        >
          {/* Mask layer: black background + white text */}
          <div className="absolute inset-0 bg-black">
            <TextRows
              layout={layout}
              scaleFactors={scaleFactors}
              className="text-white"
            />
          </div>
          {/* Video layer with multiply blend — video shows through white text */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            style={{ mixBlendMode: 'multiply' }}
            src={`https://stream.mux.com/${videoPlaybackId}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      )}

      <span className="sr-only">{label}</span>
    </Link>
  )
}
