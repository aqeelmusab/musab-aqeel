'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

import { duration, ease } from '@/lib/motion'

const WORK_SECTION_SPACING = 'px-6 py-16 md:px-12 md:py-20 lg:px-24'
const WORK_SECTION_MAX_WIDTH = 'mx-auto max-w-350'

interface ProjectImageData {
  slug: string
  title: string
  coverImage: string
}

interface WorkSectionProps {
  children: ReactNode
  className?: string
  containerClassName?: string
}

interface ProjectCoverImageProps {
  project: ProjectImageData
  aspectClassName: string
  sizes: string
  priority?: boolean
  className?: string
  imageClassName?: string
  overlayClassName?: string
  overlayStyle?: CSSProperties
  children?: ReactNode
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

export function ProjectCoverImage({
  project,
  aspectClassName,
  sizes,
  priority = false,
  className = '',
  imageClassName = '',
  overlayClassName = '',
  overlayStyle,
  children,
}: ProjectCoverImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      layoutId={`project-image-${project.slug}`}
      className={`relative overflow-hidden ${aspectClassName} ${className}`.trim()}
      style={{ backgroundColor: 'var(--color-surface)' }}
      transition={{
        layout: { duration: duration.layout, ease: ease.layout },
      }}
    >
      {!loaded && <div className="skeleton-shimmer absolute inset-0" />}
      <Image
        src={project.coverImage}
        alt={project.title}
        fill
        priority={priority}
        className={`max-w-none object-cover ${loaded ? 'opacity-100' : 'opacity-0'} ${imageClassName}`.trim()}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
      />
      {overlayStyle && (
        <div
          className={`absolute inset-0 ${overlayClassName}`.trim()}
          style={overlayStyle}
        />
      )}
      {children}
    </motion.div>
  )
}
