import type { CharMetrics } from './types'

const REFERENCE_FONT_SIZE = 100
// Width correction - canvas tends to underestimate vs DOM rendering
// Use > 1.0 to prevent overflow, but this creates gaps
const WIDTH_CORRECTION = 1.0
// Use full measured line height for accurate layout
const LINE_HEIGHT_RATIO = 1.0

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
    // Use the larger of advance width and visual width, with correction factor
    widths.set(ch, Math.max(m.width, visualWidth) * WIDTH_CORRECTION)
  }

  // Use the actual bounding box height for tighter line spacing
  const metrics = ctx.measureText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const rawLineHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  // Apply ratio for line height calculation
  const lineHeight = rawLineHeight * LINE_HEIGHT_RATIO

  return { widths, lineHeight, referenceSize: REFERENCE_FONT_SIZE }
}
