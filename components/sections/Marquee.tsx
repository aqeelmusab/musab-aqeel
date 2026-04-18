import RevealText from '@/components/ui/RevealText'

const TECH_STACK = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'Rust',
  'PHP',
  'Laravel',
  'FastAPI',
  'Django',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'AWS',
  'Tailwind CSS',
  'GSAP',
  'Three.js',
  'Webflow',
  'Framer',
  'Shopify',
  'Supabase',
  'Prisma',
]

const SERVICES = [
  'Full Stack Development',
  'UI Engineering',
  'Motion Design',
  'E-commerce',
  'CMS Integration',
  'API Development',
  'Performance Optimization',
  'Database Architecture',
  'DevOps',
  'Technical Consultation',
  'Design Systems',
  'SaaS Development',
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
            <span key={i} className="flex shrink-0 items-center">
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
        aria-label="Technologies and services"
      >
        <div className="flex flex-col gap-5 md:gap-6">
          <MarqueeRow items={TECH_STACK} direction="left" />
          <MarqueeRow items={SERVICES} direction="right" />
        </div>
      </section>
    </RevealText>
  )
}
