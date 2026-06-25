'use client'

import type Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useEffectEvent, useRef } from 'react'
import 'lenis/dist/lenis.css'

import { useIntro } from '@/lib/contexts/IntroContext'
import { LenisContext } from '@/lib/contexts/LenisContext'
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
  const { isVisible: isIntroVisible, isReadyToAnimate } = useIntro()

  const syncCurrentLocation = useEffectEvent(() => {
    const lenis = lenisRef.current
    if (!lenis || isIntroVisible || !isReadyToAnimate) return

    syncLenisToCurrentLocation(lenis)
  })

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

    syncLenisEnabled(lenis, isReadyToAnimate && !isIntroVisible)
  }, [isIntroVisible, isReadyToAnimate])

  useEffect(() => {
    if (!pathname) return

    syncCurrentLocation()
  }, [pathname])

  useEffect(() => {
    if (isIntroVisible || !isReadyToAnimate || !window.location.hash) return

    syncCurrentLocation()
  }, [isIntroVisible, isReadyToAnimate])

  useEffect(() => {
    const handleHashChange = () => {
      syncCurrentLocation()
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  )
}
