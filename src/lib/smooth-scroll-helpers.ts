'use client'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { completeScrubAnimationsAtPageEnd } from '@/lib/complete-scrub-at-page-end'
import { lenis as lenisConfig, scroll } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

export function setManualScrollRestoration() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  window.scrollTo(0, 0)
}

export function createLenisInstance() {
  return new Lenis({
    autoRaf: false,
    lerp: lenisConfig.lerp,
    smoothWheel: true,
    wheelMultiplier: lenisConfig.wheelMultiplier,
    // `syncTouch: false` (default) — hand touch back to the browser. See the
    // `lenis` config docstring in `lib/motion.ts` for the rationale.
    syncTouch: false,
    stopInertiaOnNavigate: lenisConfig.stopInertiaOnNavigate,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    overscroll: true,
  })
}

export function attachLenisTicker(lenis: Lenis) {
  const rafCallback = (time: number) => {
    lenis.raf(time * 1000)
  }

  const pinScrubAfterLenis = () => {
    completeScrubAnimationsAtPageEnd(lenis.scroll, lenis.limit)
  }

  const onLenisScroll = () => {
    ScrollTrigger.update()
  }
  lenis.on('scroll', onLenisScroll)

  gsap.ticker.add(rafCallback)
  gsap.ticker.add(pinScrubAfterLenis)
  gsap.ticker.lagSmoothing(0)

  return () => {
    lenis.off('scroll', onLenisScroll)
    gsap.ticker.remove(rafCallback)
    gsap.ticker.remove(pinScrubAfterLenis)
  }
}

export function refreshScrollTrigger(frames = 1) {
  if (frames <= 1) {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return
  }

  requestAnimationFrame(() => {
    refreshScrollTrigger(frames - 1)
  })
}

export function syncLenisEnabled(lenis: Lenis, enabled: boolean) {
  if (enabled) {
    lenis.start()
    refreshScrollTrigger()
    return
  }

  lenis.stop()
}

export function syncLenisToCurrentLocation(lenis: Lenis) {
  const hash = window.location.hash

  if (hash) {
    requestAnimationFrame(() => {
      const element = document.querySelector(hash)
      if (element instanceof HTMLElement) {
        lenis.scrollTo(element, {
          offset: -scroll.headerOffset,
          immediate: true,
        })
      }

      refreshScrollTrigger()
    })
    return
  }

  lenis.scrollTo(0, { immediate: true })
  refreshScrollTrigger(2)
}
