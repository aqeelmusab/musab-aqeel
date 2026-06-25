import RevealText from '@/components/ui/reveal/RevealText'
import SplitText from '@/components/ui/reveal/SplitText'
import type { ProcessStep } from '@/types'

const STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'Understanding the actual problem before writing a line of code. Scope, constraints, success criteria, and technical landscape mapped in full before anything starts.',
  },
  {
    number: '02',
    title: 'Architecture',
    description:
      'Planning the stack, structure, and key decisions before building. The right foundation means fewer rewrites and faster delivery down the line.',
  },
  {
    number: '03',
    title: 'Build',
    description:
      'Iterative delivery with regular checkpoints, not a black box. You see progress early, give feedback while it matters, and nothing ships that you have not reviewed.',
  },
  {
    number: '04',
    title: 'Ship',
    description:
      'Deployment, handoff, documentation, and follow-up. The project is not done when the code works. It is done when you can run it without me.',
  },
]

export default function Process() {
  return (
    <section id="process" className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto max-w-350">
        <RevealText>
          <span className="section-label mb-4 block">{'// 03 Process'}</span>
        </RevealText>
        <SplitText
          as="h2"
          className="font-display mb-16 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
        >
          How I work
        </SplitText>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <RevealText key={step.number} delay={0.05 + i * 0.08}>
              <div
                className="relative pt-6"
                style={{ borderTop: '1px solid var(--color-border-sub)' }}
              >
                <span
                  className="mb-4 block font-mono text-4xl font-normal lg:text-5xl"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {step.number}
                </span>
                <h3 className="font-display mb-3 text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {step.description}
                </p>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  )
}
