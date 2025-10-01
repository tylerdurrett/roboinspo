import { useEffect } from 'react'
import useScreenSize from './useScreenSize'

/**
 * Keeps the `--viewportHeight` CSS variable in sync with the real viewport so
 * containers with the `.h-viewport` utility stay flush on mobile browsers.
 */
export default function useViewportHeight(): void {
  const { height } = useScreenSize()
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--viewportHeight',
      `${height}px`
    )
  }, [height])
}
