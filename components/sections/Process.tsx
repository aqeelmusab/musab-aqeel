'use client'

import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'
import type { ProcessStep } from '@/types'

const STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    description: 'Understanding the actual problem before writing a line of code. Scope, constraints, success criteria, and technical landscape mapped in full before anything starts.',
  },
  {
    number: '02',
    title: 'Architecture',
    description: 'Planning the stack, structure, and key decisions before building. The right foundation means fewer rewrites and faster delivery down the line.',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Iterative delivery with regular checkpoints, not a black box. You see progress early, give feedback while it matters, and nothing ships that you have not reviewed.',
  },
  {
    number: '04',
    title: 'Ship',
    description: 'Deployment, handoff, documentation, and follow-up. The project is not done when the code works. It is done when you can run it without me.',
  },
]

export default function Process() {
  return (
    <section id="process" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <RevealText>
          <span className="section-label block mb-4">
            {'// 03 Process'}
          </span>
        </RevealText>
        <SplitText
          as="h2"
          className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-16 font-display"
        >
          How I work
        </SplitText>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STEPS.map((step, i) => (
            <RevealText key={step.number} delay={0.05 + i * 0.08}>
              <div className="relative pt-6" style={{ borderTop: '1px solid var(--color-border-sub)' }}>
                <span
                  className="text-4xl lg:text-5xl font-normal mb-4 block font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {step.number}
                </span>
                <h3
                  className="text-xl font-medium tracking-tight mb-3 font-display"
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed font-body"
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
