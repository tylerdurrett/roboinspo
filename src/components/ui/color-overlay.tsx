import React from 'react'

interface ColorOverlayProps {
  /**
   * Any valid CSS color value (hex, rgb, hsl, named colors, etc.)
   */
  color: string
  /**
   * Alpha/opacity value between 0 and 1
   * @default 1
   */
  alpha?: number
  /**
   * Child elements to render underneath the overlay
   */
  children: React.ReactNode
  /**
   * Additional CSS class names to apply to the container
   */
  className?: string
}

/**
 * ColorOverlay - A component that renders children with a color overlay on top
 *
 * @example
 * <ColorOverlay color="red" alpha={0.5}>
 *   <img src="/image.jpg" alt="Example" />
 * </ColorOverlay>
 *
 * @example
 * <ColorOverlay color="rgba(255, 0, 0, 0.3)">
 *   <div>Some content</div>
 * </ColorOverlay>
 */
export default function ColorOverlay({
  color,
  alpha = 1,
  children,
  className = '',
}: ColorOverlayProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {children}
      <div
        style={{
          backgroundColor: color,
          opacity: alpha,
        }}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  )
}
