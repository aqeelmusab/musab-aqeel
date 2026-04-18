'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import DustFilterSvg from '@/components/ui/DustFilterSvg'
import {
  createRevealScrollTrigger,
  getDustFilterStyle,
  getRevealScrollStart,
  scheduleScrollTriggerRefresh,
  useTextAnimationBase,
} from '@/components/ui/text-animation'
import { dust } from '@/lib/motion'

interface RevealTextProps {
  children: ReactNode
  className?: string
  /**
   * Offsets the ScrollTrigger start so nested blocks can feel slightly staggered
   * (approx. pixels added to `start`; scroll-synced only).
   */
  delay?: number
}

export default function RevealText({
  children,
  className = '',
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const {
    cleanup,
    displacementRef,
    dustActive,
    filterId,
    isReadyToAnimate,
    reducedMotion,
    scrollTriggerRef,
  } = useTextAnimationBase()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !isReadyToAnimate) return

    cleanup()

    const start = getRevealScrollStart(delay)
    const revealScrollTrigger = createRevealScrollTrigger(el, start)

    const fe = displacementRef.current
    const useDust = !reducedMotion && fe

    if (useDust) {
      const tl = gsap.timeline({
        scrollTrigger: revealScrollTrigger,
      })

      tl.fromTo(
        el,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, ease: 'none', duration: 1 },
        0,
      ).fromTo(
        fe,
        { attr: { scale: dust.maxDisplacement } },
        { attr: { scale: 0 }, ease: 'none', duration: 1 },
        0,
      )

      scrollTriggerRef.current = tl.scrollTrigger ?? null
    } else {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: revealScrollTrigger,
        },
      )
      scrollTriggerRef.current = tween.scrollTrigger ?? null
    }

    const cancelRefresh = scheduleScrollTriggerRefresh()

    return () => {
      cancelRefresh()
      cleanup()
    }
  }, [delay, cleanup, displacementRef, isReadyToAnimate, reducedMotion, scrollTriggerRef])

  return (
    <>
      {dustActive && (
        <DustFilterSvg id={filterId} displacementRef={displacementRef} />
      )}
      <div
        ref={ref}
        data-reveal
        className={className}
        style={getDustFilterStyle(dustActive, filterId)}
      >
        {children}
      </div>
    </>
  )
}
