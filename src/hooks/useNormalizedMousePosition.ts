import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { Vector2 } from 'three'

// This hook grabs the mouse position, normalizes it for the screen width,
// and stores it as a THREE.Vector2 in a ref
export default function useNormalizedMousePosition(): RefObject<Vector2> {
  const mousePos = useRef<Vector2>(new Vector2(0, 0))

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e
    const screenSizeX = window.innerWidth
    const screenSizeY = window.innerHeight
    const mouseX = clientX
    const mouseY = screenSizeY - clientY
    mousePos.current.set(mouseX / screenSizeX, mouseY / screenSizeY)
  }, [])

  useEffect(() => {
    window?.addEventListener('mousemove', handleMouseMove)
    return () => {
      window?.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  return mousePos
}
