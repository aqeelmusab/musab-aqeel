'use client'

import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import { useLoader } from '@/lib/LoaderContext'
import { useLenisRef } from '@/lib/lenis-context'
import { duration, ease } from '@/lib/motion'
import { scrollToHashSection } from '@/lib/scroll-navigation'

export default function Hero() {
  const scrollLineRef = useRef<HTMLDivElement>(null)
  const { isReadyToAnimate } = useLoader()
  const lenisRef = useLenisRef()

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 12 } as const,
    animate: isReadyToAnimate
      ? {
          opacity: 1,
          y: 0,
          transition: { duration: duration.base, ease: ease.out, delay },
        }
      : { opacity: 0, y: 12 },
  })

  useEffect(() => {
    if (!scrollLineRef.current || !isReadyToAnimate) return
    const tl = gsap.to(scrollLineRef.current, {
      scaleY: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
    })
    return () => {
      tl.kill()
    }
  }, [isReadyToAnimate])

  return (
    <section
      aria-label="Introduction"
      className="hero relative flex flex-col overflow-hidden px-6 pt-28 pb-16 md:px-12 md:pt-32 md:pb-24 lg:px-24"
    >
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-[800px] w-[800px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          opacity: 0.03,
        }}
        aria-hidden="true"
      />

      {/* Headline block */}
      <div className="relative z-10 flex max-w-[1200px] flex-1 flex-col justify-center">
        <div className="mb-4 md:mb-6">
          <SplitText
            as="h1"
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: 'var(--text-hero)', lineHeight: 1.05 }}
            trigger="load"
            delay={0.1}
          >
            Musab Aqeel.
          </SplitText>
          <SplitText
            as="h2"
            className="font-display font-semibold tracking-tight"
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
          className="font-body mb-8 max-w-[600px] text-base leading-relaxed md:mb-12 md:text-lg"
          style={{
            fontWeight: 300,
            color: 'var(--color-text-secondary)',
          }}
        >
          I take complete projects from zero to production, across any stack, at
          a pace most teams cannot match.
        </motion.p>

        <motion.div {...fadeUp(0.5)} className="flex items-center gap-5">
          <MagneticButton
            className="btn-outline md:px-8 md:py-3.5 md:text-base"
            onClick={() => scrollToHashSection(lenisRef, '#contact', { duration: 0.8 })}
          >
            Start a project
          </MagneticButton>
          <MagneticButton
            className="btn-text md:text-base"
            onClick={() => scrollToHashSection(lenisRef, '#work', { duration: 0.8 })}
          >
            View work{' '}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Bottom bar - social proof left, scroll indicator right */}
      <div className="relative z-10 flex items-end justify-between">
        <motion.p
          {...fadeUp(0.7)}
          className="font-mono text-[10px] tracking-widest uppercase md:text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Trusted by 25+ clients worldwide
        </motion.p>

        <motion.div
          {...fadeUp(0.85)}
          className="ml-4 flex shrink-0 flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span
            className="font-mono text-[9px] tracking-widest uppercase md:text-[10px]"
            style={{
              color: 'var(--color-text-tertiary)',
              writingMode: 'vertical-rl',
            }}
          >
            scroll
          </span>
          <div
            className="h-6 w-px origin-top md:h-8"
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
