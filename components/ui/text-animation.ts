'use client'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useId, useRef, type CSSProperties } from 'react'

import { useScrollTriggerCleanup } from '@/components/ui/useScrollTriggerCleanup'
import { useLoader } from '@/lib/LoaderContext'
import { scroll } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export function getRevealScrollStart(delay: number) {
  return delay !== 0
    ? `${scroll.revealStart}+=${Math.round(delay * 72)}`
    : scroll.revealStart
}

export function createRevealScrollTrigger(trigger: Element, start: string) {
  return {
    trigger,
    start,
    end: scroll.revealEnd,
    scrub: scroll.revealScrub,
    invalidateOnRefresh: true,
  }
}

export function scheduleScrollTriggerRefresh() {
  const raf = requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })

  return () => {
    cancelAnimationFrame(raf)
  }
}

export function getDustFilterStyle(
  dustActive: boolean,
  filterId: string,
  style?: CSSProperties,
) {
  if (!dustActive) {
    return style
  }

  return {
    ...style,
    filter: `url(#${filterId})`,
  }
}

export function useTextAnimationBase() {
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const reactId = useId()
  const filterId = `dust-${reactId.replace(/:/g, '')}`
  const { isReadyToAnimate } = useLoader()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()
  const reducedMotion = usePrefersReducedMotion()

  return {
    cleanup,
    displacementRef,
    dustActive: !reducedMotion,
    filterId,
    isReadyToAnimate,
    reducedMotion,
    scrollTriggerRef,
  }
}
