'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { LenisContext } from '@/lib/lenis-context'
import { useLoader } from '@/lib/LoaderContext'
import {
  attachLenisTicker,
  createLenisInstance,
  setManualScrollRestoration,
  syncLenisEnabled,
  syncLenisToCurrentLocation,
} from '@/lib/smooth-scroll-helpers'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()
  const { isLoading, isReadyToAnimate } = useLoader()

  useEffect(() => {
    setManualScrollRestoration()

    const lenis = createLenisInstance()
    lenisRef.current = lenis

    lenis.stop()
    const detachTicker = attachLenisTicker(lenis)

    return () => {
      detachTicker()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    syncLenisEnabled(lenis, isReadyToAnimate && !isLoading)
  }, [isLoading, isReadyToAnimate])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    syncLenisToCurrentLocation(lenis)
  }, [pathname])

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  )
}
