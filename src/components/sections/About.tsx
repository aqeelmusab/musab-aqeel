'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import RevealText from '@/components/ui/reveal/RevealText'
import SplitText from '@/components/ui/reveal/SplitText'

const SCROLL_EPS = 2

function AboutTerminalBlock({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ left: false, right: false })

  const updateFade = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const hOverflow = scrollWidth > clientWidth + SCROLL_EPS
    setFade({
      left: hOverflow && scrollLeft > SCROLL_EPS,
      right: hOverflow && scrollLeft + clientWidth < scrollWidth - SCROLL_EPS,
    })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const rafId = requestAnimationFrame(updateFade)
    const ro = new ResizeObserver(updateFade)
    ro.observe(el)
    el.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      el.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [updateFade])

  const fadeBase =
    'pointer-events-none absolute z-10 transition-opacity duration-200 ease-out'
  const fadeSurface = { backgroundColor: 'var(--color-surface-up)' } as const

  return (
    <div className="relative min-w-0">
      {/* biome-ignore lint/a11y/useSemanticElements: region role is deliberate; a styled scroll container, not a document section */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        /**
         * Opt this subtree out of Lenis so the horizontal trackpad/touch scroll
         * doesn't fight the page scroll. Lenis also applies
         * `overscroll-behavior: contain` via its own stylesheet when this
         * attribute is present. `touch-action: pan-x` declares the element's
         * gesture intent so mobile browsers route diagonal swipes cleanly
         * (horizontal to the terminal, vertical to the page).
         */
        data-lenis-prevent
        style={{ touchAction: 'pan-x' }}
        /**
         * The code block overflows horizontally on narrow viewports, so the
         * scroll container must be keyboard-reachable (axe:
         * scrollable-region-focusable). The region role gives the tab stop an
         * accessible name.
         */
        role="region"
        aria-label="Engagement terms"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll container must be keyboard-focusable (axe scrollable-region-focusable)
        tabIndex={0}
      >
        <pre className="m-0 box-border inline-block w-max max-w-none min-w-full p-5 align-top">
          {children}
        </pre>
      </div>
      <div
        className={`${fadeBase} inset-y-0 left-0 w-10`}
        style={{
          ...fadeSurface,
          opacity: fade.left ? 1 : 0,
          maskImage: 'linear-gradient(to right, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, black, transparent)',
        }}
        aria-hidden="true"
      />
      <div
        className={`${fadeBase} inset-y-0 right-0 w-10`}
        style={{
          ...fadeSurface,
          opacity: fade.right ? 1 : 0,
          maskImage: 'linear-gradient(to left, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}

const CODE_BLOCK = `const engagement = {
  scope:     'design to deployment',
  delivery:  'weeks, not months',
  ownership: 'single operator, zero handoffs',
  stack:     'matched to the problem',
  pricing:   'project value, not hours',
  revisions: 'until it ships right',
  support:   'post-launch included',
}`

const DETAILS = [
  'Remote / Worldwide',
  'Full stack - design to deployment',
  'Response within 24 hours',
]

export default function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto grid max-w-350 grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <RevealText>
            <span className="section-label mb-4 block">{'// 01 About'}</span>
          </RevealText>

          <SplitText
            as="h2"
            className="font-display mb-8 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
          >
            Built on systems. Delivered fast.
          </SplitText>

          <RevealText delay={0.05}>
            <p
              className="font-body mb-10 max-w-130 text-lg leading-relaxed"
              style={{
                fontWeight: 300,
                color: 'var(--color-text-secondary)',
              }}
            >
              Close to a decade of building has produced something more useful
              than experience: systems. Reusable architectures, hardened
              workflows, and an AI stack that compresses timelines from months
              to weeks without touching quality. I take projects from zero to
              deployed, across any stack, and I ship them fast.
            </p>
          </RevealText>

          <div className="flex flex-col">
            {DETAILS.map((detail, i) => (
              <RevealText key={detail} delay={0.1 + i * 0.05}>
                <div
                  className="flex items-center gap-3 py-3"
                  style={{ borderTop: '1px solid var(--color-border-sub)' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span
                    className="font-body text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {detail}
                  </span>
                </div>
              </RevealText>
            ))}
          </div>
        </div>

        <RevealText delay={0.15}>
          <div
            className="overflow-hidden rounded-sm"
            style={{
              backgroundColor: 'var(--color-surface-up)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border-sub)' }}
              aria-hidden="true"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-border-up)' }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-border-up)' }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-border-up)' }}
              />
            </div>
            <AboutTerminalBlock>
              <code className="font-mono text-[13px] leading-[1.7]">
                {CODE_BLOCK.split('\n').map((line, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static code listing that never reorders
                    key={i}
                  >
                    {line.includes(':') ? (
                      <>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {line.split(':')[0]}
                        </span>
                        <span style={{ color: 'var(--color-text-tertiary)' }}>
                          :
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {line.split(':').slice(1).join(':')}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {line}
                      </span>
                    )}
                  </div>
                ))}
              </code>
            </AboutTerminalBlock>
          </div>
        </RevealText>
      </div>
    </section>
  )
}
