/**
 * Text-Fill Layout Type Definitions
 * ==================================
 *
 * These types support the text-fill algorithm which fills a rectangular block
 * with text where each row is independently scaled to fill the width, and
 * total row heights exactly fill the block height.
 */

/**
 * Character metrics measured at a reference font size.
 * Used by the layout algorithm to calculate row breaks and scaling.
 */
export interface CharMetrics {
  /**
   * Map of character to width at reference font size.
   * Width is the visual bounding box width, not just advance width.
   */
  widths: Map<string, number>

  /**
   * Line height (ascent + descent) at reference font size.
   * Based on actualBoundingBox for tighter spacing with all-caps text.
   */
  lineHeight: number

  /**
   * The reference font size used for all measurements (typically 100px).
   * All metrics scale linearly from this reference.
   */
  referenceSize: number
}

/**
 * Layout information for a single row of text.
 */
export interface RowLayout {
  /** The characters assigned to this row */
  chars: string

  /**
   * Computed font size (px) that makes this row fill the block width.
   * Formula: referenceSize × (blockWidth / rowRefWidth)
   */
  fontSize: number

  /**
   * Row height (px) at the computed font size.
   * Formula: lineHeight × (blockWidth / rowRefWidth)
   */
  height: number
}

/**
 * Complete layout for a text block.
 */
export interface BlockLayout {
  /** Layout for each row, in order from top to bottom */
  rows: RowLayout[]

  /**
   * Sum of all row heights.
   * After final correction, this equals the block height exactly.
   */
  totalHeight: number
}
