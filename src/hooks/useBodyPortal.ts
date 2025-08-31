'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const createdRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let el = document.getElementById(id) as HTMLElement | null
    if (!el) {
      el = document.createElement(tag)
      el.id = id
      document.body.appendChild(el)
      createdRef.current = true
    }

    if (className) {
      el.className = className
    }

    setContainer(el)

    return () => {
      if (createdRef.current && removeOnUnmount && el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }, [id, className, tag, removeOnUnmount])

  return container
}
