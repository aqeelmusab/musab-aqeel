'use client'

import type Lenis from 'lenis'
import { createContext, type RefObject, useContext } from 'react'

// Expose the Lenis ref (not state) so consumers get the live instance
// without triggering extra renders when it initialises.
const defaultLenisRef: RefObject<Lenis | null> = Object.freeze({
  current: null,
})
export const LenisContext =
  createContext<RefObject<Lenis | null>>(defaultLenisRef)

export const useLenisRef = () => useContext(LenisContext)
