'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { Gradient, Ornament, Spot } from '@/components/fx/FxLayer'

export type FxState = {
  spots?: Spot[]
  gradients?: Gradient[]
  ornaments?: Ornament[]
  enableParallax?: boolean
} | null

type FxContextValue = {
  fx: FxState
  setFx: (next: FxState) => void
}

const FxContext = createContext<FxContextValue | undefined>(undefined)

export function FxProvider({ children }: { children: React.ReactNode }) {
  const [fx, setFxState] = useState<FxState>(null)

  const setFx = useCallback((next: FxState) => setFxState(next), [])

  const value = useMemo(() => ({ fx, setFx }), [fx, setFx])

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>
}

export function useFx() {
  const ctx = useContext(FxContext)
  if (!ctx) {
    throw new Error('useFx must be used within an FxProvider')
  }
  return ctx
}
