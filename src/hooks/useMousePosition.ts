import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { Vector2 } from 'three'

// This hook grabs the mouse position,
// and stores it as a THREE.Vector2 in a ref
export default function useMousePosition(
  callback?: (mousePos: Vector2) => void
): RefObject<Vector2> {
  const mousePos = useRef<Vector2>(new Vector2(0, 0))

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { clientX, clientY } = e
      mousePos.current.set(clientX, clientY)
      if (callback) {
        callback(mousePos.current)
      }
    },
    [callback]
  )

  useEffect(() => {
    if (window) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (window) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [handleMouseMove])

  return mousePos
}
