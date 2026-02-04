'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTextFillLayout } from '@/hooks/useTextFillLayout'

const FONT_FAMILY = 'league-gothic, sans-serif'

interface TextFillBlockProps {
  text: string
  label: string
  href: string
  className?: string
}

export default function TextFillBlock({
  text,
  label,
  href,
  className,
}: TextFillBlockProps) {
  const containerRef = useRef<HTMLAnchorElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scaleFactors, setScaleFactors] = useState<number[]>([])

  const layout = useTextFillLayout({
    text,
    containerRef,
    fontFamily: FONT_FAMILY,
  })

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

  return (
    <Link
      ref={containerRef}
      href={href}
      className={cn(
        'relative block overflow-hidden',
        'hover:opacity-70 transition-opacity duration-300',
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
      {layout && scaleFactors.length === layout.rows.length && (
        <div className="flex flex-col" aria-hidden="true">
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
      )}
      <span className="sr-only">{label}</span>
    </Link>
  )
}
