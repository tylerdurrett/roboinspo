/**
 * Character Measurement for Text-Fill Layout
 * ==========================================
 *
 * This module measures character metrics using the Canvas API at a reference
 * font size. These measurements are used by the layout algorithm to calculate
 * row breaks and font sizes.
 *
 * ## Why Canvas Measurement?
 *
 * Canvas provides access to precise font metrics through measureText(), which
 * returns both advance width (how far the cursor moves) and bounding box
 * dimensions (the actual visual extent of glyphs).
 *
 * ## Width Measurement
 *
 * We use the larger of:
 * - `width`: The advance width (cursor movement)
 * - `actualBoundingBoxLeft + actualBoundingBoxRight`: Visual bounding box
 *
 * Some glyphs (especially italics or decorative fonts) extend beyond their
 * advance width, so the visual bounding box is more accurate for layout.
 *
 * ## Height Measurement
 *
 * We use `actualBoundingBoxAscent + actualBoundingBoxDescent` rather than
 * `fontBoundingBoxAscent + fontBoundingBoxDescent` because:
 * - actualBoundingBox measures the actual rendered glyphs
 * - fontBoundingBox includes space for accents and descenders we may not use
 * - For all-caps text, actualBoundingBox gives tighter, more accurate spacing
 *
 * ## Canvas vs DOM Rendering Differences
 *
 * Canvas measurements don't perfectly match DOM rendering due to:
 * - Font hinting differences at various sizes
 * - Sub-pixel rendering
 * - CSS-specific font features
 *
 * The component compensates by measuring actual rendered widths and applying
 * CSS scaleX transforms to achieve pixel-perfect width filling.
 */

import type { CharMetrics } from './types'

/** Reference font size for all measurements (px) */
const REFERENCE_FONT_SIZE = 100

/**
 * Width correction factor. Set to 1.0 because the component applies
 * post-render scaleX correction to handle canvas/DOM differences.
 */
const WIDTH_CORRECTION = 1.0

/**
 * Line height ratio. Set to 1.0 to use actual measured height.
 * Values < 1.0 would tighten line spacing (may cause overlap).
 */
const LINE_HEIGHT_RATIO = 1.0

/**
 * Measure character widths and line height for the given text and font.
 *
 * @param text - The text to measure (all unique characters will be measured)
 * @param fontFamily - CSS font-family string (e.g., "league-gothic, sans-serif")
 * @returns Character metrics including width map, line height, and reference size
 */
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

  // Measure each unique character's width
  const widths = new Map<string, number>()
  for (const ch of new Set(text)) {
    const m = ctx.measureText(ch)
    // Use full visual bounding box to account for glyphs extending beyond advance width
    const visualWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
    widths.set(ch, Math.max(m.width, visualWidth) * WIDTH_CORRECTION)
  }

  // Measure line height using full alphabet for representative sample
  const metrics = ctx.measureText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const rawLineHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const lineHeight = rawLineHeight * LINE_HEIGHT_RATIO

  return { widths, lineHeight, referenceSize: REFERENCE_FONT_SIZE }
}
