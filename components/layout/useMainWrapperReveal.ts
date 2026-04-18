'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function getLoaderElements() {
  const loader = document.querySelector('.loader') as HTMLElement | null
  const loaderContent = document.querySelector('.loader-content') as HTMLElement | null

  return {
    loader,
    loaderContent,
  }
}

function revealWithoutLoader({
  loader,
  onRevealComplete,
}: {
  loader: HTMLElement | null
  onRevealComplete: () => void
}) {
  if (loader) {
    loader.style.visibility = 'hidden'
  }

  onRevealComplete()
}

export function useMainWrapperReveal({
  isLoading,
  wrapperRef,
  hasAnimatedRef,
  onRevealComplete,
}: {
  isLoading: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  hasAnimatedRef: RefObject<boolean>
  onRevealComplete: () => void
}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (isLoading || hasAnimatedRef.current) {
        return
      }

      hasAnimatedRef.current = true
      window.scrollTo(0, 0)

      const { loader, loaderContent } = getLoaderElements()
      const wrapper = wrapperRef.current

      if (!loader || !loaderContent || !wrapper) {
        revealWithoutLoader({
          loader,
          onRevealComplete,
        })
        return
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          loader.style.visibility = 'hidden'
          onRevealComplete()
        },
      })

      timelineRef.current = timeline

      timeline.to(loaderContent, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      })

      timeline.to(
        loader,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.2,
          ease: 'power4.inOut',
        },
        '-=0.15',
      )

      timeline.fromTo(
        wrapper,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power4.inOut',
          clearProps: 'clipPath',
        },
        '<',
      )
    },
    { dependencies: [hasAnimatedRef, isLoading, onRevealComplete, wrapperRef] },
  )

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [timelineRef])
}
