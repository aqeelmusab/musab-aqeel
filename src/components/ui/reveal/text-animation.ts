'use client'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type CSSProperties, useId, useRef } from 'react'

import { useScrollTriggerCleanup } from '@/components/ui/reveal/useScrollTriggerCleanup'
import { useIntro } from '@/lib/contexts/IntroContext'
import { useIsCoarsePointer } from '@/lib/hooks/useIsCoarsePointer'
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion'
import { scroll } from '@/lib/motion'

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
  const { isReadyToAnimate } = useIntro()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()
  const reducedMotion = usePrefersReducedMotion()
  // Dust = SVG feTurbulence + feDisplacementMap. Cheap on desktop GPUs,
  // prohibitively expensive on mobile GPUs where it causes frame drops
  // during scroll. Disable on touch-primary devices.
  const coarsePointer = useIsCoarsePointer()

  return {
    cleanup,
    displacementRef,
    dustActive: !reducedMotion && !coarsePointer,
    filterId,
    isReadyToAnimate,
    reducedMotion,
    scrollTriggerRef,
  }
}
