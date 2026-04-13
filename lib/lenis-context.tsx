'use client'

import { createContext, useContext, type MutableRefObject } from 'react'
import type Lenis from 'lenis'

// Expose the Lenis ref (not state) so consumers get the live instance
// without triggering extra renders when it initialises.
export const LenisContext = createContext<MutableRefObject<Lenis | null>>({ current: null })

export const useLenisRef = () => useContext(LenisContext)
