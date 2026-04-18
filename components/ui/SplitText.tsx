'use client'

import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'

import DustFilterSvg from '@/components/ui/DustFilterSvg'
import {
  createRevealScrollTrigger,
  getDustFilterStyle,
  getRevealScrollStart,
  scheduleScrollTriggerRefresh,
  useTextAnimationBase,
} from '@/components/ui/text-animation'
import { dust, stagger } from '@/lib/motion'

interface SplitTextProps {
  children: string
  className?: string
  style?: CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  trigger?: 'load' | 'scroll'
  delay?: number
}

export default function SplitText({
  children,
  className = '',
  style,
  as: Tag = 'h2',
  trigger: propTrigger = 'scroll',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const loadTlRef = useRef<gsap.core.Timeline | null>(null)
  const dustTweenRef = useRef<gsap.core.Tween | null>(null)
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
    const container = containerRef.current
    if (!container) return

    const words = container.querySelectorAll<HTMLSpanElement>('.split-word')
    if (words.length === 0) return

    const isLoad = propTrigger === 'load'

    if (!isReadyToAnimate) {
      gsap.set(words, { yPercent: 110 })
      return
    }

    cleanup()
    dustTweenRef.current?.scrollTrigger?.kill()
    dustTweenRef.current?.kill()
    dustTweenRef.current = null
    loadTlRef.current?.kill()
    loadTlRef.current = null

    if (isLoad) {
      gsap.set(words, { yPercent: 110 })

      const fe = displacementRef.current
      const useDust = !reducedMotion && fe

      if (useDust) {
        const tl = gsap.timeline({ delay })
        tl.fromTo(
          fe,
          { attr: { scale: dust.maxDisplacement } },
          { attr: { scale: 0 }, duration: 0.75, ease: 'power3.out' },
          0,
        ).to(
          words,
          {
            yPercent: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: stagger.tight,
          },
          0,
        )
        loadTlRef.current = tl
      } else {
        const tl = gsap.timeline({ delay })
        tl.to(words, {
          yPercent: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: stagger.tight,
        })
        loadTlRef.current = tl
      }

      return () => {
        loadTlRef.current?.kill()
        loadTlRef.current = null
      }
    }

    const start = getRevealScrollStart(delay)

    gsap.set(words, { yPercent: 110 })

    const fe = displacementRef.current
    const useDust = !reducedMotion && fe
    const st = createRevealScrollTrigger(container, start)

    const wordsTween = gsap.fromTo(
      words,
      { yPercent: 110 },
      {
        yPercent: 0,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: st,
      },
    )

    scrollTriggerRef.current = wordsTween.scrollTrigger ?? null

    if (useDust) {
      dustTweenRef.current = gsap.fromTo(
        fe,
        { attr: { scale: dust.maxDisplacement } },
        {
          attr: { scale: 0 },
          ease: 'none',
          scrollTrigger: { ...st },
        },
      )
    }

    const cancelRefresh = scheduleScrollTriggerRefresh()

    return () => {
      cancelRefresh()
      dustTweenRef.current?.scrollTrigger?.kill()
      dustTweenRef.current?.kill()
      dustTweenRef.current = null
      cleanup()
    }
  }, [
    propTrigger,
    delay,
    cleanup,
    displacementRef,
    isReadyToAnimate,
    reducedMotion,
    scrollTriggerRef,
  ])

  const words = children.split(' ')

  return (
    <>
      {dustActive && (
        <DustFilterSvg id={filterId} displacementRef={displacementRef} />
      )}
      <Tag
        ref={(el) => {
          containerRef.current = el
        }}
        className={className}
        style={getDustFilterStyle(dustActive, filterId, style)}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <span className="split-word inline-block">
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </span>
          </span>
        ))}
      </Tag>
    </>
  )
}
