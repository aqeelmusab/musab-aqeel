'use client'

import { useCallback, useRef, type MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import Tag from '@/components/ui/Tag'
import { ProjectCoverImage } from '@/components/work/primitives'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  className?: string
}

export default function ProjectCard({
  project,
  className = '',
}: ProjectCardProps) {
  const router = useRouter()
  const transitioning = useRef(false)

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      if (transitioning.current) return
      transitioning.current = true

      const linkEl = e.currentTarget as HTMLElement
      const card = linkEl.querySelector('.card-wrapper') as HTMLElement | null

      if (!card) {
        router.push(`/work/${project.slug}`)
        return
      }

      const section =
        card.closest('section') ??
        card.closest('[class*="max-w"]')?.parentElement
      if (section) {
        const allCards = Array.from(section.querySelectorAll('.card-wrapper'))
        const others = allCards.filter((el) => el !== card)
        if (others.length > 0) {
          gsap.to(others, {
            opacity: 0,
            y: 12,
            duration: 0.3,
            ease: 'power2.in',
            stagger: 0.03,
          })
        }

        const chrome = Array.from(
          section.querySelectorAll(
            '[class*="section-label"], h2, h1, [class*="btn-"], a[href="/work"]',
          ),
        )
        if (chrome.length > 0) {
          gsap.to(chrome, { opacity: 0, duration: 0.25, ease: 'power2.in' })
        }
      }

      const meta = card.querySelector('.card-meta')
      if (meta) {
        gsap.to(meta, { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' })
      }

      setTimeout(() => {
        router.push(`/work/${project.slug}`)
        transitioning.current = false
      }, 350)
    },
    [project.slug, router],
  )

  return (
    <Link
      href={`/work/${project.slug}`}
      className={`group block ${className}`}
      onClick={handleClick}
    >
      <div className="card-wrapper" data-cursor="project">
        <ProjectCoverImage
          project={project}
          aspectClassName="aspect-16/10"
          className="rounded-[2px]"
          imageClassName="transition-all duration-700 group-hover:scale-[1.03]"
          overlayClassName="transition-opacity duration-500 group-hover:opacity-60"
          overlayStyle={{
            background: 'linear-gradient(to top, var(--color-bg), transparent 60%)',
            opacity: 0.7,
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="card-meta mt-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-medium tracking-tight md:text-xl">
              {project.title}
            </h3>
            <p
              className="font-body mt-1 text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {project.client} / {project.type}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
