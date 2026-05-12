'use client'

import { useEffect, useState } from 'react'

import { INTRO_DURATION_MS } from '@/lib/motion'

/**
 * Module-level flag so the intro plays at most once per browser session.
 * Subsequent in-app navigations (or remounts within the same tab) skip
 * straight to the revealed state.
 */
let introHasPlayed = false

export function useIntroBootstrap() {
  const [isVisible, setIsVisible] = useState(!introHasPlayed)
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(introHasPlayed)

  useEffect(() => {
    if (introHasPlayed) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false)
      introHasPlayed = true
    }, INTRO_DURATION_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return {
    isVisible,
    isReadyToAnimate,
    setIsReadyToAnimate,
  }
}
