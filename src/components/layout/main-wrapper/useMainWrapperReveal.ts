'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function getIntroElements() {
  const intro = document.querySelector('.intro') as HTMLElement | null
  const introContent = document.querySelector(
    '.intro-content',
  ) as HTMLElement | null

  return {
    intro,
    introContent,
  }
}

function revealWithoutIntro({
  intro,
  onRevealComplete,
}: {
  intro: HTMLElement | null
  onRevealComplete: () => void
}) {
  if (intro) {
    intro.style.visibility = 'hidden'
  }

  onRevealComplete()
}

export function useMainWrapperReveal({
  isIntroVisible,
  wrapperRef,
  hasAnimatedRef,
  onRevealComplete,
}: {
  isIntroVisible: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  hasAnimatedRef: RefObject<boolean>
  onRevealComplete: () => void
}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (isIntroVisible || hasAnimatedRef.current) {
        return
      }

      hasAnimatedRef.current = true
      window.scrollTo(0, 0)

      const { intro, introContent } = getIntroElements()
      const wrapper = wrapperRef.current

      if (!intro || !introContent || !wrapper) {
        revealWithoutIntro({
          intro,
          onRevealComplete,
        })
        return
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          intro.style.visibility = 'hidden'
          onRevealComplete()
        },
      })

      timelineRef.current = timeline

      // Phase 1 — intro content acknowledges it's leaving: fast ease-in
      // fade with a slight upward drift.
      timeline.to(introContent, {
        opacity: 0,
        y: -24,
        duration: 0.4,
        ease: 'power2.in',
      })

      // Phase 2 — intro slides off the top of the viewport. Pure transform
      // + opacity animation, which is GPU-composited reliably on iOS/macOS
      // Safari where clip-path on fixed elements has long-standing jank.
      // `yPercent: -105` gives a 5% buffer so there's never a sub-pixel
      // sliver left at the bottom edge during a rounding stutter.
      timeline.to(
        intro,
        {
          yPercent: -105,
          duration: 1.0,
          ease: 'power4.inOut',
        },
        '-=0.15',
      )

      // Phase 3 — page wrapper rises into place in parallel with the intro
      // lift-off. Shared direction (both moving up) reads as one coordinated
      // motion rather than two overlapping events. A softer ease-out settles
      // the content as the intro accelerates away.
      timeline.fromTo(
        wrapper,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          clearProps: 'transform,opacity,willChange',
        },
        '<',
      )
    },
    {
      dependencies: [
        hasAnimatedRef,
        isIntroVisible,
        onRevealComplete,
        wrapperRef,
      ],
    },
  )

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [timelineRef])
}
