'use client'

import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react'

export type UseBodyPortalOptions = {
  id: string
  className?: string
  tag?: keyof HTMLElementTagNameMap
  removeOnUnmount?: boolean
}

/**
 * Creates or reuses a DOM element on document.body to serve as a portal root.
 * - If an element with the provided id exists, it will be reused and not removed on unmount.
 * - If not, it creates the element and cleans it up on unmount (configurable).
 * - Applies the provided className to the element (overwrites existing classes).
 */
export function useBodyPortal(
  options: UseBodyPortalOptions
): HTMLElement | null {
  const { id, className, tag = 'div', removeOnUnmount = true } = options
  const createdRef = useRef(false)
  const containerRef = useRef<HTMLElement | null>(null)

  // Memoize getSnapshot to include className application
  const getSnapshot = useCallback(() => {
    // Check if we need to update the existing element
    if (containerRef.current) {
      if (className !== undefined) {
        containerRef.current.className = className
      }
      return containerRef.current
    }

    let el = document.getElementById(id) as HTMLElement | null
    if (!el) {
      el = document.createElement(tag)
      el.id = id
      document.body.appendChild(el)
      createdRef.current = true
    }

    if (className !== undefined) {
      el.className = className
    }

    containerRef.current = el
    return el
  }, [id, tag, className])

  // Use useSyncExternalStore for safe synchronous access to DOM
  const container = useSyncExternalStore(
    // subscribe - no-op since we don't need to listen for external changes
    () => () => {},
    getSnapshot,
    // getServerSnapshot - return null on server
    () => null
  )

  // Cleanup on unmount
  useEffect(() => {
    const wasCreated = createdRef.current
    const el = containerRef.current

    return () => {
      if (wasCreated && removeOnUnmount && el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }, [removeOnUnmount])

  return container
}
