import { useEffect } from 'react'
import useScreenSize from './useScreenSize'

export default function useViewportHeight(): void {
  const { height } = useScreenSize()
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--viewportHeight',
      `${height}px`
    )
  }, [height])
}
