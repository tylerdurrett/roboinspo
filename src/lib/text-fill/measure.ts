import type { CharMetrics } from './types'

const REFERENCE_FONT_SIZE = 100

export function measureCharacters(
  text: string,
  fontFamily: string
): CharMetrics {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2d canvas context')
  }

  ctx.font = `${REFERENCE_FONT_SIZE}px ${fontFamily}`

  const widths = new Map<string, number>()
  for (const ch of new Set(text)) {
    // Use the full visual bounding box width, not just advance width
    // This accounts for glyphs that extend beyond their advance width
    const m = ctx.measureText(ch)
    const visualWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
    // Use the larger of advance width and visual width
    widths.set(ch, Math.max(m.width, visualWidth))
  }

  // Use the actual bounding box height for tighter line spacing
  // This excludes excessive whitespace above/below glyphs
  const metrics = ctx.measureText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const lineHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  return { widths, lineHeight, referenceSize: REFERENCE_FONT_SIZE }
}
