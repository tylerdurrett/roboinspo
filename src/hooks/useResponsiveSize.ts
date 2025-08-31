'use client'

import { useState, useEffect } from 'react'

// Default Tailwind CSS breakpoints
const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

type ScreenSize = keyof typeof screens

const getScreenSize = (width: number): ScreenSize | 'default' => {
  const sortedScreens = (Object.keys(screens) as ScreenSize[]).sort(
    (a, b) => parseInt(screens[a]) - parseInt(screens[b])
  )

  for (let i = sortedScreens.length - 1; i >= 0; i--) {
    const screen = sortedScreens[i]
    if (width >= parseInt(screens[screen])) {
      return screen
    }
  }
  return 'default'
}

interface Size {
  width: string | number
  height: string | number
}

export interface ResponsiveSize {
  default: Size
  sm?: Size
  md?: Size
  lg?: Size
  xl?: Size
  '2xl'?: Size
}

export default function useResponsiveSize(sizes: ResponsiveSize): Size | null {
  const [size, setSize] = useState<Size | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const screenSize = getScreenSize(window.innerWidth)
      const newSize = sizes[screenSize] ?? sizes.default
      setSize(newSize)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sizes])

  return size
}
