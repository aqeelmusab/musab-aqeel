'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import Tag from '@/components/ui/Tag'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  className?: string
}

export default function ProjectCard({ project, className = '' }: ProjectCardProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Link href={`/work/${project.slug}`} className={`group block ${className}`}>
      <div className="card-wrapper" data-cursor="project">
        <motion.div
          layoutId={`project-image-${project.slug}`}
          className="relative aspect-[16/10] overflow-hidden rounded-[2px]"
          style={{ backgroundColor: 'var(--color-surface)' }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {!loaded && <ImageSkeleton />}
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setLoaded(true)}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
            style={{
              background: 'linear-gradient(to top, var(--color-bg), transparent 60%)',
              opacity: 0.7,
            }}
          />
        </motion.div>

        <div className="flex items-start justify-between mt-4">
          <div>
            <h3
              className="text-lg md:text-xl font-medium tracking-tight font-display"
            >
              {project.title}
            </h3>
            <p
              className="text-xs mt-1 font-body"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {project.client} / {project.type}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {project.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ImageSkeleton() {
  return (
    <div className="absolute inset-0 skeleton-shimmer" />
  )
}
