import type Lenis from 'lenis'
import type { RefObject } from 'react'

import { scroll } from '@/lib/motion'

export type LenisRef = RefObject<Lenis | null>

interface ScrollTargetOptions {
  duration?: number
  offset?: number
  onComplete?: () => void
  delayMs?: number
  restartLenis?: boolean
}

function runAfterDelay(callback: () => void, delayMs: number) {
  if (delayMs <= 0) {
    callback()
    return
  }

  window.setTimeout(callback, delayMs)
}

export function scrollToPageTop(
  lenisRef: LenisRef,
  {
    duration = 1,
    delayMs = 0,
    onComplete,
    restartLenis = false,
  }: ScrollTargetOptions = {},
) {
  runAfterDelay(() => {
    const lenis = lenisRef.current

    if (restartLenis) {
      lenis?.start()
    }

    if (lenis) {
      lenis.scrollTo(0, {
        duration,
        onComplete,
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
    onComplete?.()
  }, delayMs)
}

export function scrollToElement(
  lenisRef: LenisRef,
  target: HTMLElement,
  {
    duration = 1,
    offset = -scroll.headerOffset,
    delayMs = 0,
    onComplete,
    restartLenis = false,
  }: ScrollTargetOptions = {},
) {
  runAfterDelay(() => {
    const lenis = lenisRef.current

    if (restartLenis) {
      lenis?.start()
    }

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration,
        onComplete,
      })
      return
    }

    const y = target.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    onComplete?.()
  }, delayMs)
}

export function scrollToHashSection(
  lenisRef: LenisRef,
  href: string,
  options: ScrollTargetOptions = {},
): boolean {
  const target = document.querySelector<HTMLElement>(href)

  if (!target) {
    return false
  }

  scrollToElement(lenisRef, target, options)
  return true
}
