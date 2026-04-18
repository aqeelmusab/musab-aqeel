import RevealText from '@/components/ui/RevealText'
import SplitText from '@/components/ui/SplitText'
import type { Testimonial } from '@/types'

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We came in expecting a two-month timeline. Musab shipped in three weeks and the quality was better than what our last agency delivered in six. He understood the problem faster than we could explain it.',
    name: 'Rana Wajahat',
    role: 'CTO',
    company: 'Bexton Pvt Ltd',
  },
  {
    quote:
      'Most developers give you a list of technologies. Musab gave us a working product before anyone else finished their proposal. The site still performs flawlessly under traffic we did not plan for.',
    name: 'Allison Chapman',
    role: 'Founder',
    company: 'Fiviza LLC',
  },
  {
    quote:
      'He picked up a stack he had never worked with, built the entire platform in under a month, and it passed our security audit on the first try. I have stopped looking for other developers.',
    name: 'Ansh Patel',
    role: 'Head of Product',
    company: 'Asaya',
  },
]

export default function Testimonials() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <RevealText>
          <span className="section-label mb-4 block">
            {'// 04 Testimonials'}
          </span>
        </RevealText>
        <SplitText
          as="h2"
          className="font-display mb-16 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
        >
          What clients say
        </SplitText>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <RevealText key={t.name} delay={0.05 + i * 0.08}>
              <div
                className="flex h-full flex-col rounded-[2px] p-6 md:p-8"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-sub)',
                }}
              >
                <span
                  className="font-display mb-4 block text-6xl leading-none"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  &ldquo;
                </span>
                <p
                  className="font-body mb-8 flex-1 text-base leading-relaxed md:text-lg"
                  style={{ fontWeight: 300 }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-medium">{t.name}</p>
                    <p
                      className="font-body mt-0.5 text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {t.role}, {t.company}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[10px] tracking-widest uppercase"
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
