'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

import DustFilterSvg from '@/components/ui/reveal/DustFilterSvg'
import {
  createRevealScrollTrigger,
  getDustFilterStyle,
  getRevealScrollStart,
  scheduleScrollTriggerRefresh,
  useTextAnimationBase,
} from '@/components/ui/reveal/text-animation'
import { dust } from '@/lib/motion'

const HIDDEN_STATE = { opacity: 0, y: 32 } as const
const VISIBLE_STATE = { opacity: 1, y: 0 } as const

interface RevealTextProps {
  children: ReactNode
  className?: string
  /**
   * `scroll` (default): fade/slide scrubs to the scroll position.
   * `load`: plays a one-shot, time-based fade-up on mount — used when the
   *   reveal must replay in place (e.g. after the contact form resets) where
   *   the element is already in view and there's no scroll left to drive it.
   */
  trigger?: 'load' | 'scroll'
  /**
   * `scroll` mode: offsets the ScrollTrigger start so nested blocks feel
   *   slightly staggered (approx. pixels added to `start`).
   * `load` mode: delay in seconds before this block's fade-up begins (stagger).
   */
  delay?: number
}

export default function RevealText({
  children,
  className = '',
  trigger = 'scroll',
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const loadTlRef = useRef<gsap.core.Timeline | null>(null)
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
    if (!el) return

    const isLoad = trigger === 'load'

    if (!isReadyToAnimate) {
      // Keep load-mode blocks hidden until the intro clears so they don't flash
      // visible before their timed reveal runs.
      if (isLoad) gsap.set(el, HIDDEN_STATE)
      return
    }

    cleanup()
    loadTlRef.current?.kill()
    loadTlRef.current = null

    if (reducedMotion) {
      gsap.set(el, { ...VISIBLE_STATE, clearProps: 'transform' })
      return
    }

    if (isLoad) {
      gsap.set(el, HIDDEN_STATE)

      let canceled = false
      let raf1 = 0
      let raf2 = 0

      const runLoadTimeline = () => {
        if (canceled) return
        const liveEl = ref.current
        if (!liveEl) return

        gsap.set(liveEl, HIDDEN_STATE)

        const fe = displacementRef.current
        const useDust = dustActive && fe

        const tl = gsap.timeline({ delay })
        tl.fromTo(
          liveEl,
          HIDDEN_STATE,
          { ...VISIBLE_STATE, duration: 0.8, ease: 'power3.out' },
          0,
        )

        if (useDust) {
          tl.fromTo(
            fe,
            { attr: { scale: dust.maxDisplacement } },
            { attr: { scale: 0 }, duration: 0.75, ease: 'power3.out' },
            0,
          )
        }

        loadTlRef.current = tl
      }

      // Two rAFs let the browser commit the remounted DOM before the staggered
      // transforms start painting (mirrors SplitText's load path).
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(runLoadTimeline)
      })

      return () => {
        canceled = true
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        loadTlRef.current?.kill()
        loadTlRef.current = null
      }
    }

    const start = getRevealScrollStart(delay)
    const revealScrollTrigger = createRevealScrollTrigger(el, start)

    const fe = displacementRef.current
    const useDust = dustActive && !reducedMotion && fe

    if (useDust) {
      const tl = gsap.timeline({
        scrollTrigger: revealScrollTrigger,
      })

      tl.fromTo(
        el,
        HIDDEN_STATE,
        { ...VISIBLE_STATE, ease: 'none', duration: 1 },
        0,
      ).fromTo(
        fe,
        { attr: { scale: dust.maxDisplacement } },
        { attr: { scale: 0 }, ease: 'none', duration: 1 },
        0,
      )

      scrollTriggerRef.current = tl.scrollTrigger ?? null
    } else {
      const tween = gsap.fromTo(el, HIDDEN_STATE, {
        ...VISIBLE_STATE,
        ease: 'none',
        scrollTrigger: revealScrollTrigger,
      })
      scrollTriggerRef.current = tween.scrollTrigger ?? null
    }

    const cancelRefresh = scheduleScrollTriggerRefresh()

    return () => {
      cancelRefresh()
      cleanup()
    }
  }, [
    trigger,
    delay,
    cleanup,
    displacementRef,
    dustActive,
    isReadyToAnimate,
    reducedMotion,
    scrollTriggerRef,
  ])

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
