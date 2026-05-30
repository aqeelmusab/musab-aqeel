import RevealText from '@/components/ui/reveal/RevealText'

// Capability-level phrasing (intent over tool names) so the breadth reads
// clearly without turning into a cluttered list of every language/framework.
const CAPABILITIES = [
  'Full Stack Engineering',
  'Type-Safe Architecture',
  'Real-time Systems',
  'Scalable Databases',
  'Cloud Infrastructure',
  'Motion & Interaction',
  'Headless Commerce',
  'API Design',
  'Performance Engineering',
  'AI-Accelerated Delivery',
]

const SERVICES = [
  'Complete System Builds',
  'Architecture & Scoping',
  'Surgical Fixes & Optimization',
  'Design to Deployment',
  'SaaS Platforms',
  'E-commerce Platforms',
  'Dashboards & Internal Tools',
  'MVP to Production',
  'Technical Consulting',
]

function MarqueeRow({
  items,
  direction,
}: {
  items: string[]
  direction: 'left' | 'right'
}) {
  const repeated = [...items, ...items]

  return (
    <div className="marquee-mask overflow-hidden">
      <div
        className={
          direction === 'left'
            ? 'animate-marquee-left'
            : 'animate-marquee-right'
        }
        style={{ width: 'max-content' }}
        aria-hidden="true"
      >
        <div className="flex items-center">
          {repeated.map((item, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: items list is duplicated and may contain repeats; the row is static, aria-hidden, and never reorders.
              key={`${i}-${item}`}
              className="flex shrink-0 items-center"
            >
              <span
                className="px-5 font-mono text-base whitespace-nowrap md:px-7 md:text-lg"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item}
              </span>
              <span
                className="text-[6px] md:text-[8px]"
                style={{ color: 'var(--color-text-tertiary)' }}
                aria-hidden="true"
              >
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <RevealText>
      <section
        className="my-16 py-8 md:my-24 md:py-10"
        style={{
          borderTop: '1px solid var(--color-border-sub)',
          borderBottom: '1px solid var(--color-border-sub)',
        }}
        aria-label="Capabilities and services"
      >
        <div className="flex flex-col gap-5 md:gap-6">
          <MarqueeRow items={CAPABILITIES} direction="left" />
          <MarqueeRow items={SERVICES} direction="right" />
        </div>
      </section>
    </RevealText>
  )
}
