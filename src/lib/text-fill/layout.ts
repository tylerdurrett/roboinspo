/**
 * Text-Fill Layout Algorithm
 * ==========================
 *
 * This module implements a layout algorithm that fills a rectangular block with
 * text, where each row is independently scaled to fill the block width, and the
 * total row heights fill the block height exactly.
 *
 * ## Problem Statement
 *
 * Given:
 * - A string of characters (spaces stripped)
 * - A block with known width and height
 * - Character metrics (widths at a reference font size)
 *
 * Find:
 * - How to break the text into rows
 * - The font size for each row such that it fills the block width
 * - Row heights that sum to exactly the block height
 *
 * ## Algorithm Overview
 *
 * The key insight is that the relationship between "target reference width"
 * (the maximum width a row can have at reference size before breaking) and
 * total height is monotonically decreasing:
 *
 * - Smaller targetRefWidth → more line breaks → more rows → taller total
 * - Larger targetRefWidth → fewer line breaks → fewer rows → shorter total
 *
 * This monotonic relationship allows us to use binary search to find the
 * exact targetRefWidth that produces a total height equal to the block height.
 *
 * ## Steps
 *
 * 1. **Character Measurement**: Measure each unique character's width at a
 *    reference font size (100px) using canvas. Also measure line height.
 *
 * 2. **Binary Search**: Search for the targetRefWidth where:
 *    - Pack characters greedily into rows (break when adding next char exceeds target)
 *    - Calculate each row's scale factor: blockWidth / rowRefWidth
 *    - Row height = lineHeight × scale
 *    - Total height = sum of row heights
 *    - Converge when totalHeight ≈ blockHeight (within 0.5px tolerance)
 *
 * 3. **Last Row Rebalancing**: If the last row has fewer than 3 characters,
 *    steal characters from the previous row to avoid orphaned letters.
 *
 * 4. **Final Correction**: Apply a uniform correction factor to all rows to
 *    ensure pixel-perfect vertical fill (accounts for floating-point errors).
 *
 * ## Post-Processing (in component)
 *
 * After layout calculation, the component measures each row's actual rendered
 * width and applies a CSS scaleX transform to stretch/compress the text to
 * exactly fill the container width. This compensates for differences between
 * canvas measurement and DOM rendering.
 *
 * ## Complexity
 *
 * - Binary search: O(log(maxWidth/tolerance)) ≈ 20 iterations
 * - Each iteration packs O(n) characters
 * - Total: O(n × log(maxWidth)) where n = text length
 */

import type { CharMetrics, RowLayout, BlockLayout } from './types'

/** Minimum characters allowed in the last row before rebalancing (landscape/default) */
const MIN_CHARS_LAST_ROW = 3

/** Binary search converges when height difference is within this tolerance (px) */
const BINARY_SEARCH_TOLERANCE = 0.5

/** Maximum binary search iterations (safety limit) */
const BINARY_SEARCH_MAX_ITERATIONS = 50

/**
 * Horizontal safety margin for width calculation.
 * Set to 1.0 (no margin) because the component applies scaleX correction
 * to handle differences between canvas measurement and DOM rendering.
 */
const HORIZONTAL_SAFETY_MARGIN = 1.0

/**
 * Aspect ratio threshold above which we consider the container "mobile/short" mode.
 * When blocks are wide and short (typical of stacked mobile layout), we use more
 * aggressive rebalancing for better visual results.
 *
 * On mobile portrait: blocks are full-width, 1/3 height → aspect ratio ~1.4
 * On desktop landscape: blocks are 1/3 width, full height → aspect ratio ~0.5
 */
const MOBILE_ASPECT_RATIO_THRESHOLD = 1.2

/**
 * Minimum width ratio between the shorter and longer row when there are only 2 rows
 * in mobile/short mode. This prevents awkward splits like "READINGL/IST" (3 chars).
 * A ratio of 0.5 means the shorter row must be at least 50% the width of the longer.
 */
const MIN_TWO_ROW_BALANCE_RATIO_MOBILE = 0.5

/**
 * Minimum width ratio for desktop/tall mode (more permissive).
 */
const MIN_TWO_ROW_BALANCE_RATIO_DESKTOP = 0.25

/**
 * Options for the layout algorithm.
 */
export interface LayoutOptions {
  /**
   * Preferred break point indices (0-based position after which to break).
   * Only used in mobile mode. For example, for "READINGLIST" with breakHints: [7],
   * the algorithm will prefer breaking after position 7 → "READING" / "LIST".
   */
  breakHints?: number[]
}

/**
 * Sum the reference-size widths of characters in a string.
 */
function rowRefWidth(chars: string, widths: Map<string, number>): number {
  let w = 0
  for (const ch of chars) {
    w += widths.get(ch) ?? 0
  }
  return w
}

/**
 * Greedily pack characters into rows. A new row starts when adding
 * the next character would exceed `targetRefWidth`.
 */
function packRows(
  text: string,
  widths: Map<string, number>,
  targetRefWidth: number
): string[] {
  const rows: string[] = []
  let currentChars = ''
  let currentWidth = 0

  for (const ch of text) {
    const chWidth = widths.get(ch) ?? 0
    if (currentChars.length > 0 && currentWidth + chWidth > targetRefWidth) {
      rows.push(currentChars)
      currentChars = ch
      currentWidth = chWidth
    } else {
      currentChars += ch
      currentWidth += chWidth
    }
  }

  if (currentChars.length > 0) {
    rows.push(currentChars)
  }

  return rows
}

/**
 * If the last row has fewer than MIN_CHARS_LAST_ROW characters,
 * steal characters from the previous row to rebalance.
 */
function rebalanceLastRow(rows: string[]): string[] {
  if (rows.length < 2) return rows

  const last = rows[rows.length - 1]
  if (last.length >= MIN_CHARS_LAST_ROW) return rows

  const prev = rows[rows.length - 2]
  const charsNeeded = MIN_CHARS_LAST_ROW - last.length
  const splitAt = Math.max(1, prev.length - charsNeeded)

  const result = [...rows]
  result[rows.length - 2] = prev.slice(0, splitAt)
  result[rows.length - 1] = prev.slice(splitAt) + last

  return result
}

/**
 * Enhanced rebalancing that considers visual width ratios, not just character counts.
 * For two-row layouts in mobile mode, ensures the shorter row is at least
 * MIN_TWO_ROW_BALANCE_RATIO_MOBILE of the longer row's width.
 *
 * When breakHints are provided and we're in mobile mode, prefers breaking at
 * the hint position for more semantic word breaks.
 */
function rebalanceRowsForAspectRatio(
  rows: string[],
  widths: Map<string, number>,
  aspectRatio: number,
  options?: LayoutOptions
): string[] {
  // First apply basic character-count rebalancing
  let result = rebalanceLastRow(rows)

  // Enhanced balancing only applies to 2-row layouts
  if (result.length !== 2) return result

  // Mobile/stacked layouts have wide, short blocks (aspect ratio > threshold)
  // Desktop/side-by-side layouts have narrow, tall blocks (aspect ratio < threshold)
  const isMobileLayout = aspectRatio > MOBILE_ASPECT_RATIO_THRESHOLD

  // If we're on mobile and have break hints, try to use them first
  if (isMobileLayout && options?.breakHints?.length) {
    const combined = result[0] + result[1]
    const hint = options.breakHints[0] // Use first hint for 2-row layouts

    // Validate hint is within bounds
    if (hint > 0 && hint < combined.length) {
      const hintRow0 = combined.slice(0, hint)
      const hintRow1 = combined.slice(hint)

      // Calculate the balance ratio with the hint split
      const hintWidth0 = rowRefWidth(hintRow0, widths)
      const hintWidth1 = rowRefWidth(hintRow1, widths)
      const hintRatio =
        Math.min(hintWidth0, hintWidth1) / Math.max(hintWidth0, hintWidth1)

      // Use hint split if it meets minimum balance threshold
      if (hintRatio >= MIN_TWO_ROW_BALANCE_RATIO_MOBILE) {
        return [hintRow0, hintRow1]
      }
    }
  }

  // Fall back to algorithmic rebalancing
  const minBalanceRatio = isMobileLayout
    ? MIN_TWO_ROW_BALANCE_RATIO_MOBILE
    : MIN_TWO_ROW_BALANCE_RATIO_DESKTOP

  const width0 = rowRefWidth(result[0], widths)
  const width1 = rowRefWidth(result[1], widths)

  // Calculate current balance ratio (shorter / longer)
  const currentRatio = Math.min(width0, width1) / Math.max(width0, width1)

  // If already balanced enough, return as-is
  if (currentRatio >= minBalanceRatio) return result

  // Need to rebalance: combine and re-split for better balance
  const combined = result[0] + result[1]
  const totalWidth = rowRefWidth(combined, widths)

  // Target: split so that the shorter row is at least minBalanceRatio of the longer
  // For ratio r, shorter = r * longer, and shorter + longer = total
  // So: r*longer + longer = total => longer = total / (1 + r)
  // And: shorter = total - longer = total * r / (1 + r)
  const targetLongerWidth = totalWidth / (1 + minBalanceRatio)

  // Find the best split point that gets us closest to the target balance
  let bestSplit = result[0].length
  let bestDiff = Infinity

  // Try all possible split points and find the one closest to target balance
  let runningWidth = 0
  for (let i = 1; i < combined.length; i++) {
    runningWidth += widths.get(combined[i - 1]) ?? 0
    const row0Width = runningWidth
    const row1Width = totalWidth - runningWidth

    // We want the longer row to be close to targetLongerWidth
    const longerWidth = Math.max(row0Width, row1Width)
    const diff = Math.abs(longerWidth - targetLongerWidth)

    if (diff < bestDiff) {
      bestDiff = diff
      bestSplit = i
    }
  }

  // Apply the new split, but only if it's actually better
  const newRow0 = combined.slice(0, bestSplit)
  const newRow1 = combined.slice(bestSplit)
  const newWidth0 = rowRefWidth(newRow0, widths)
  const newWidth1 = rowRefWidth(newRow1, widths)
  const newRatio =
    Math.min(newWidth0, newWidth1) / Math.max(newWidth0, newWidth1)

  // Only use new split if it improves balance
  if (newRatio > currentRatio) {
    result = [newRow0, newRow1]
  }

  return result
}

/**
 * Convert row strings into RowLayout objects with computed font sizes
 * and heights based on block width.
 */
function buildRowLayouts(
  rows: string[],
  metrics: CharMetrics,
  blockWidth: number
): RowLayout[] {
  const { widths, lineHeight, referenceSize } = metrics

  return rows.map((chars) => {
    const refWidth = rowRefWidth(chars, widths)
    // Apply safety margin to prevent overflow from font rendering differences
    const scale = (blockWidth / refWidth) * HORIZONTAL_SAFETY_MARGIN
    return {
      chars,
      fontSize: referenceSize * scale,
      height: lineHeight * scale,
    }
  })
}

/**
 * Compute the total height produced by packing characters into rows
 * at a given targetRefWidth.
 */
function totalHeightForTarget(
  text: string,
  metrics: CharMetrics,
  blockWidth: number,
  targetRefWidth: number,
  aspectRatio: number,
  options?: LayoutOptions
): number {
  const packedRows = packRows(text, metrics.widths, targetRefWidth)
  const rows = rebalanceRowsForAspectRatio(
    packedRows,
    metrics.widths,
    aspectRatio,
    options
  )
  const layouts = buildRowLayouts(rows, metrics, blockWidth)
  return layouts.reduce((sum, r) => sum + r.height, 0)
}

/**
 * Compute the full block layout: determine line breaks and per-row
 * font sizes such that the text fills the block both horizontally
 * and vertically.
 *
 * Uses binary search on the targetRefWidth parameter (the maximum
 * reference-width a row can have before breaking). The relationship
 * totalHeight(targetRefWidth) is monotonically decreasing:
 * - Smaller targetRefWidth = more rows = taller total
 * - Larger targetRefWidth = fewer rows = shorter total
 *
 * @param text - The text to layout
 * @param metrics - Character metrics from canvas measurement
 * @param blockWidth - Container width in pixels
 * @param blockHeight - Container height in pixels
 * @param aspectRatio - Container aspect ratio (width/height), used for responsive balancing
 * @param options - Optional layout options including break hints
 */
export function computeLayout(
  text: string,
  metrics: CharMetrics,
  blockWidth: number,
  blockHeight: number,
  aspectRatio: number = blockWidth / blockHeight,
  options?: LayoutOptions
): BlockLayout {
  const { widths } = metrics

  // Bounds for binary search
  const allCharsWidth = rowRefWidth(text, widths)
  const maxCharWidth = Math.max(...Array.from(widths.values()))

  // Edge case: single row fills or exceeds block height
  const singleRowLayouts = buildRowLayouts([text], metrics, blockWidth)
  if (singleRowLayouts[0].height >= blockHeight) {
    const correction = blockHeight / singleRowLayouts[0].height
    return {
      rows: [
        {
          ...singleRowLayouts[0],
          fontSize: singleRowLayouts[0].fontSize * correction,
          height: blockHeight,
        },
      ],
      totalHeight: blockHeight,
    }
  }

  // Binary search: find targetRefWidth where totalHeight == blockHeight
  let lo = maxCharWidth // most rows (tallest)
  let hi = allCharsWidth // one row (shortest)

  for (let i = 0; i < BINARY_SEARCH_MAX_ITERATIONS; i++) {
    const mid = (lo + hi) / 2
    const h = totalHeightForTarget(
      text,
      metrics,
      blockWidth,
      mid,
      aspectRatio,
      options
    )

    if (Math.abs(h - blockHeight) < BINARY_SEARCH_TOLERANCE) {
      break
    }

    if (h > blockHeight) {
      // Too tall - need fewer rows - increase targetRefWidth
      lo = mid
    } else {
      // Too short - need more rows - decrease targetRefWidth
      hi = mid
    }
  }

  const finalTargetWidth = (lo + hi) / 2
  const packedRows = packRows(text, widths, finalTargetWidth)
  const rows = rebalanceRowsForAspectRatio(
    packedRows,
    widths,
    aspectRatio,
    options
  )
  let layouts = buildRowLayouts(rows, metrics, blockWidth)

  // Final uniform correction to ensure pixel-perfect vertical fill
  const actualTotal = layouts.reduce((sum, r) => sum + r.height, 0)
  const correction = blockHeight / actualTotal

  layouts = layouts.map((r) => ({
    ...r,
    fontSize: r.fontSize * correction,
    height: r.height * correction,
  }))

  return {
    rows: layouts,
    totalHeight: blockHeight,
  }
}
