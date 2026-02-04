'use client'

import { useRef } from 'react'
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
  const layout = useTextFillLayout({
    text,
    containerRef,
    fontFamily: FONT_FAMILY,
  })

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
      {layout && (
        <div className="flex flex-col" aria-hidden="true">
          {layout.rows.map((row, i) => (
            <span
              key={i}
              className="block font-league-gothic uppercase leading-none whitespace-nowrap"
              style={{
                fontSize: `${row.fontSize}px`,
                lineHeight: `${row.height}px`,
                height: `${row.height}px`,
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
