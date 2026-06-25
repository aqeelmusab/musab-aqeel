import type { ReactNode } from 'react'

const WORK_SECTION_SPACING = 'px-6 py-16 md:px-12 md:py-20 lg:px-24'
const WORK_SECTION_MAX_WIDTH = 'mx-auto max-w-350'

interface WorkSectionProps {
  children: ReactNode
  className?: string
  containerClassName?: string
}

export function WorkSection({
  children,
  className = '',
  containerClassName = '',
}: WorkSectionProps) {
  return (
    <section className={`${WORK_SECTION_SPACING} ${className}`.trim()}>
      <div className={`${WORK_SECTION_MAX_WIDTH} ${containerClassName}`.trim()}>
        {children}
      </div>
    </section>
  )
}

export function WorkDivider() {
  return (
    <div className="px-6 md:px-12 lg:px-24">
      <div
        className="mx-auto h-px max-w-350"
        style={{ backgroundColor: 'var(--color-border-sub)' }}
      />
    </div>
  )
}
