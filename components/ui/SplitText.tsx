'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SplitTextProps {
  children: string
  className?: string
  style?: React.CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  trigger?: 'load' | 'scroll'
  delay?: number
}

export default function SplitText({
  children,
  className = '',
  style,
  as: Tag = 'h2',
  trigger = 'scroll',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)

  const cleanup = useCallback(() => {
    if (stRef.current) {
      stRef.current.kill()
      stRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const words = containerRef.current.querySelectorAll<HTMLSpanElement>('.split-word')

    gsap.set(words, { yPercent: 110 })

    if (trigger === 'load') {
      gsap.to(words, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.04,
        delay,
      })
    } else {
      const tween = gsap.to(words, {
        yPercent: 0,
        duration: 1,
        ease: 'none',
        stagger: 0.08,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 95%',
          end: 'top 65%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      stRef.current = tween.scrollTrigger ?? null
    }

    return cleanup
  }, [trigger, delay, cleanup])

  const words = children.split(' ')

  return (
    <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span className="split-word inline-block">
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}
