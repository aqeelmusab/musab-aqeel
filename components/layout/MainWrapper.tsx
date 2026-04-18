'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useMainWrapperReveal } from '@/components/layout/useMainWrapperReveal'
import { useLoader } from '@/lib/LoaderContext'

export default function MainWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isLoading, setIsReadyToAnimate } = useLoader()
  const hasAnimated = useRef(false)
  const [revealed, setRevealed] = useState(false)

  const handleRevealComplete = useCallback(() => {
    setRevealed(true)
    setIsReadyToAnimate(true)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [setIsReadyToAnimate])

  useMainWrapperReveal({
    isLoading,
    wrapperRef,
    hasAnimatedRef: hasAnimated,
    onRevealComplete: handleRevealComplete,
  })

  return (
    <div
      ref={wrapperRef}
      style={revealed ? undefined : { clipPath: 'inset(0% 0% 100% 0%)' }}
    >
      {children}
    </div>
  )
}
