'use client'

import { createContext, useContext, type RefObject } from 'react'
import type Lenis from 'lenis'

// Expose the Lenis ref (not state) so consumers get the live instance
// without triggering extra renders when it initialises.
const defaultLenisRef: RefObject<Lenis | null> = Object.freeze({
  current: null,
})
export const LenisContext =
  createContext<RefObject<Lenis | null>>(defaultLenisRef)

export const useLenisRef = () => useContext(LenisContext)
