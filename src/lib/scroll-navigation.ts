import type Lenis from 'lenis'
import type { RefObject } from 'react'

import { scroll, scrollEaseOut } from '@/lib/motion'

export type LenisRef = RefObject<Lenis | null>

type EasingFn = (t: number) => number

interface ScrollTargetOptions {
  duration?: number
  /**
   * Easing passed to `lenis.scrollTo`. Defaults to `scrollEaseOut` so every
   * programmatic scroll lands with the same soft spring as the rest of the
   * site. Pass an explicit function to override, or `null` to fall back to
   * Lenis' own default easing.
   */
  easing?: EasingFn | null
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

function resolveEasing(
  easing: EasingFn | null | undefined,
): EasingFn | undefined {
  if (easing === null) return undefined
  return easing ?? scrollEaseOut
}

export function scrollToPageTop(
  lenisRef: LenisRef,
  {
    duration = 1,
    easing,
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
      const resolvedEasing = resolveEasing(easing)
      lenis.scrollTo(0, {
        duration,
        ...(resolvedEasing && { easing: resolvedEasing }),
        ...(onComplete && { onComplete }),
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
    easing,
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
      const resolvedEasing = resolveEasing(easing)
      lenis.scrollTo(target, {
        offset,
        duration,
        ...(resolvedEasing && { easing: resolvedEasing }),
        ...(onComplete && { onComplete }),
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
