'use client'

import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import { ease, duration } from '@/lib/motion'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out, delay },
  },
})

export default function Hero() {
  const scrollLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollLineRef.current) return
    const tl = gsap.to(scrollLineRef.current, {
      scaleY: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
    })
    return () => { tl.kill() }
  }, [])

  function scrollToSection(href: string) {
    const el = document.querySelector(href)
    if (el) {
      const offset = 80
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section aria-label="Introduction" className="hero relative flex flex-col px-6 md:px-12 lg:px-24 pt-28 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      <div
        className="absolute top-1/3 right-1/4 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          opacity: 0.03,
        }}
        aria-hidden="true"
      />

      {/* Headline block */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[1200px]">
        <div className="mb-4 md:mb-6">
          <SplitText
            as="h1"
            className="font-semibold tracking-tight font-display"
            style={{ fontSize: 'var(--text-hero)', lineHeight: 1.05 }}
            trigger="load"
            delay={0.1}
          >
            Musab Aqeel.
          </SplitText>
          <SplitText
            as="h2"
            className="font-semibold tracking-tight font-display"
            style={{
              fontSize: 'var(--text-hero)',
              lineHeight: 1.05,
              color: 'var(--color-text-secondary)',
            }}
            trigger="load"
            delay={0.2}
          >
            Developer. Architect. Operator.
          </SplitText>
        </div>

        <motion.p
          {...fadeUp(0.35)}
          className="max-w-[600px] text-base md:text-lg leading-relaxed mb-8 md:mb-12 font-body"
          style={{
            fontWeight: 300,
            color: 'var(--color-text-secondary)',
          }}
        >
          I take complete projects from zero to production, across any stack,
          at a pace most teams cannot match.
        </motion.p>

        <motion.div {...fadeUp(0.5)} className="flex items-center gap-5">
          <MagneticButton
            className="btn-outline md:text-base md:px-8 md:py-3.5"
            onClick={() => scrollToSection('#contact')}
          >
            Start a project
          </MagneticButton>
          <MagneticButton
            className="btn-text md:text-base"
            onClick={() => scrollToSection('#work')}
          >
            View work <span className="arrow" aria-hidden="true">→</span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Bottom bar — social proof left, scroll indicator right */}
      <div className="relative z-10 flex items-end justify-between">
        <motion.p
          {...fadeUp(0.7)}
          className="text-[10px] md:text-xs uppercase tracking-widest font-mono"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Trusted by 25+ clients worldwide
        </motion.p>

        <motion.div
          {...fadeUp(0.85)}
          className="flex flex-col items-center gap-2 flex-shrink-0 ml-4"
          aria-hidden="true"
        >
          <span
            className="text-[9px] md:text-[10px] uppercase tracking-widest font-mono"
            style={{
              color: 'var(--color-text-tertiary)',
              writingMode: 'vertical-rl',
            }}
          >
            scroll
          </span>
          <div
            className="w-px h-6 md:h-8 origin-top"
            ref={scrollLineRef}
            style={{
              backgroundColor: 'var(--color-border-up)',
              transform: 'scaleY(0)',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
