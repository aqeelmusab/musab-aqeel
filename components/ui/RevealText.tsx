'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface RevealTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  scrub?: boolean
}

export default function RevealText({
  children,
  className = '',
  delay = 0,
  scrub = true,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)

  const cleanup = useCallback(() => {
    if (stRef.current) {
      stRef.current.kill()
      stRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return

    // gsap.set confirms the initial state already applied by the [data-reveal] CSS rule,
    // ensuring GSAP owns the property from the start with no specificity conflict.
    gsap.set(ref.current, { opacity: 0, y: 30 })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: scrub ? 1 : 0.7,
      ease: scrub ? 'none' : 'power3.out',
      // delay on a scrubbed tween creates a dead zone — only meaningful for once-mode
      delay: scrub ? 0 : delay,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 95%',
        end: 'top 65%',
        scrub: scrub ? 0.3 : false,
        once: !scrub,
        invalidateOnRefresh: true,
      },
    })

    stRef.current = tween.scrollTrigger ?? null

    return cleanup
  }, [delay, scrub, cleanup])

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
