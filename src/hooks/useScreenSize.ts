'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScreenSize {
  width: number
  height: number
}

const getScreenSize = (): ScreenSize => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

const useScreenSize = (
  callback?: (screenSize: ScreenSize) => void
): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize)

  const handleResize = useCallback(() => {
    const newScreenSize = getScreenSize()
    setScreenSize(newScreenSize)
    if (callback) {
      callback(newScreenSize)
    }
  }, [callback])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return screenSize
}

export default useScreenSize
