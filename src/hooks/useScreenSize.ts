import { useState, useEffect, useCallback } from 'react'

interface ScreenSize {
  width: number
  height: number
}

const getScreenSize = (): ScreenSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

const useScreenSize = (
  callback?: (screenSize: ScreenSize) => void
): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
  })

  const handleResize = useCallback(() => {
    const newScreenSize = getScreenSize()
    setScreenSize(newScreenSize)
    if (callback) {
      callback(newScreenSize)
    }
  }, [callback])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return screenSize
}

export default useScreenSize
