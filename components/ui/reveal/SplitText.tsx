'use client'

import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'

import DustFilterSvg from '@/components/ui/reveal/DustFilterSvg'
import {
  createRevealScrollTrigger,
  getDustFilterStyle,
  getRevealScrollStart,
  scheduleScrollTriggerRefresh,
  useTextAnimationBase,
} from '@/components/ui/reveal/text-animation'
import { dust, stagger } from '@/lib/motion'

const WORD_REVEAL_OFFSET = '1.1em'
const WORD_HIDDEN_STATE = {
  y: WORD_REVEAL_OFFSET,
  force3D: true,
} as const
const WORD_VISIBLE_STATE = {
  y: 0,
  force3D: true,
} as const

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
      gsap.set(words, WORD_HIDDEN_STATE)
      return
    }

    cleanup()
    dustTweenRef.current?.scrollTrigger?.kill()
    dustTweenRef.current?.kill()
    dustTweenRef.current = null
    loadTlRef.current?.kill()
    loadTlRef.current = null

    if (reducedMotion) {
      gsap.set(words, WORD_VISIBLE_STATE)
      return
    }

    if (isLoad) {
      gsap.set(words, WORD_HIDDEN_STATE)

      let loadCanceled = false
      let raf1 = 0
      let raf2 = 0

      const runLoadTimeline = () => {
        if (loadCanceled) return
        const liveContainer = containerRef.current
        if (!liveContainer) return
        const liveWords =
          liveContainer.querySelectorAll<HTMLSpanElement>('.split-word')
        if (liveWords.length === 0) return

        gsap.set(liveWords, WORD_HIDDEN_STATE)

        const fe = displacementRef.current
        const useDust = dustActive && !reducedMotion && fe

        if (useDust) {
          const tl = gsap.timeline({ delay })
          tl.fromTo(
            fe,
            { attr: { scale: dust.maxDisplacement } },
            { attr: { scale: 0 }, duration: 0.75, ease: 'power3.out' },
            0,
          ).to(
            liveWords,
            {
              ...WORD_VISIBLE_STATE,
              duration: 0.8,
              ease: 'power3.out',
              stagger: stagger.tight,
            },
            0,
          )
          loadTlRef.current = tl
        } else {
          const tl = gsap.timeline({ delay })
          tl.to(liveWords, {
            ...WORD_VISIBLE_STATE,
            duration: 0.8,
            ease: 'power3.out',
            stagger: stagger.tight,
          })
          loadTlRef.current = tl
        }
      }

      // Two rAFs after intro/reveal lets Chromium Android commit compositor
      // state before staggered transforms inside overflow clips start painting.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(runLoadTimeline)
      })

      return () => {
        loadCanceled = true
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        loadTlRef.current?.kill()
        loadTlRef.current = null
      }
    }

    const start = getRevealScrollStart(delay)

    gsap.set(words, WORD_HIDDEN_STATE)

    const fe = displacementRef.current
    const useDust = dustActive && !reducedMotion && fe
    const st = createRevealScrollTrigger(container, start)

    const wordsTween = gsap.fromTo(words, WORD_HIDDEN_STATE, {
      ...WORD_VISIBLE_STATE,
      ease: 'none',
      stagger: 0.06,
      scrollTrigger: st,
    })

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
    dustActive,
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
          <span
            key={i}
            className="inline-block overflow-hidden"
            style={{ transform: 'translateZ(0)' }}
          >
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
