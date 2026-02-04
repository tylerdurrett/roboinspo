export interface CharMetrics {
  /** Width of each character at the reference font size */
  widths: Map<string, number>
  /** Line height (ascent + descent) at the reference font size */
  lineHeight: number
  /** The reference font size used for measurement */
  referenceSize: number
}

export interface RowLayout {
  /** Characters in this row */
  chars: string
  /** Font size (px) that makes this row fill the block width */
  fontSize: number
  /** Rendered height of this row at the computed font size */
  height: number
}

export interface BlockLayout {
  /** Layout for each row of text */
  rows: RowLayout[]
  /** Total height of all rows (should match block height) */
  totalHeight: number
}
