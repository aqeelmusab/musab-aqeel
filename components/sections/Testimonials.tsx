'use client'

import RevealText from '@/components/ui/RevealText'
import SplitText from '@/components/ui/SplitText'
import type { Testimonial } from '@/types'

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'We came in expecting a two-month timeline. Musab shipped in three weeks and the quality was better than what our last agency delivered in six. He understood the problem faster than we could explain it.',
    name: 'Rana Wajahat',
    role: 'CTO',
    company: 'Bexton Pvt Ltd',
  },
  {
    quote: 'Most developers give you a list of technologies. Musab gave us a working product before anyone else finished their proposal. The site still performs flawlessly under traffic we did not plan for.',
    name: 'Allison Chapman',
    role: 'Founder',
    company: 'Fiviza LLC',
  },
  {
    quote: 'He picked up a stack he had never worked with, built the entire platform in under a month, and it passed our security audit on the first try. I have stopped looking for other developers.',
    name: 'Ansh Patel',
    role: 'Head of Product',
    company: 'Asaya',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <RevealText>
          <span className="section-label block mb-4">
            {'// 04 Testimonials'}
          </span>
        </RevealText>
        <SplitText
          as="h2"
          className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-16 font-display"
        >
          What clients say
        </SplitText>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <RevealText key={t.name} delay={0.05 + i * 0.08}>
              <div
                className="p-6 md:p-8 rounded-[2px] h-full flex flex-col"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-sub)',
                }}
              >
                <span
                  className="text-6xl leading-none mb-4 block font-display"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  &ldquo;
                </span>
                <p
                  className="text-base md:text-lg leading-relaxed mb-8 flex-1 font-body"
                  style={{ fontWeight: 300 }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium font-body">
                      {t.name}
                    </p>
                    <p
                      className="text-xs mt-0.5 font-body"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {t.role}, {t.company}
                    </p>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-widest font-mono"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Verified
                  </span>
                </div>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  )
}
