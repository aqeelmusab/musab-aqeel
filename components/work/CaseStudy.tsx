'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import RevealText from '@/components/ui/RevealText'
import Tag from '@/components/ui/Tag'
import ProjectCard from '@/components/work/ProjectCard'
import { ease } from '@/lib/motion'
import { projects } from '@/lib/projects'
import type { Project } from '@/types'

interface CaseStudyProps {
  project: Project
}

export default function CaseStudy({ project }: CaseStudyProps) {
  const otherProjects = projects.filter(p => p.slug !== project.slug).slice(0, 2)
  const [heroLoaded, setHeroLoaded] = useState(false)

  return (
    <article>
      {/* Hero image */}
      <motion.div
        layoutId={`project-image-${project.slug}`}
        className="relative w-full aspect-[16/8] overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {!heroLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          priority
          className={`object-cover transition-opacity duration-500 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="100vw"
          onLoad={() => setHeroLoaded(true)}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 50%)',
          }}
        />
        <div className="absolute bottom-8 left-6 md:left-12 lg:left-24">
          <p
            className="text-xs mb-2 font-mono"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {project.type} / {project.year}
          </p>
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight font-display"
          >
            {project.title}
          </h1>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ease.out, delay: 0.3 }}
      >
        {/* Overview */}
        <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <p
                className="text-xl leading-relaxed font-body"
                style={{
                  fontWeight: 300,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {project.summary}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <MetaRow label="Client" value={project.client} />
              <MetaRow label="Year" value={project.year} />
              <MetaRow label="Role" value="Full Stack Development" />
              <div>
                <span
                  className="text-xs uppercase tracking-widest block mb-2 font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                </div>
              </div>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm inline-flex items-center gap-1.5 mt-2 font-body"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  View live ↗
                </a>
              )}
            </div>
          </div>
        </section>

        <Divider />

        {/* Problem */}
        <CaseSection label="Problem" content={project.problem} />

        {/* Approach */}
        <CaseSection label="Approach" content={project.approach} />

        {/* Key Decisions */}
        <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <span className="section-label block mb-8">Key Decisions</span>
            <div className="flex flex-col gap-10">
              {project.decisions.map((d, i) => (
                <RevealText key={i} delay={i * 0.08}>
                  <h3
                    className="text-xl md:text-2xl font-medium tracking-tight mb-3 font-display"
                  >
                    {d.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-[680px] font-body"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {d.description}
                  </p>
                </RevealText>
              ))}
            </div>
          </div>
        </section>

        {/* Outcome */}
        <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <span className="section-label block mb-8">Outcome</span>
            {project.outcomeMetrics && (
              <RevealText>
                <div className="flex flex-wrap items-center gap-10 md:gap-16 mb-10">
                  {project.outcomeMetrics.map((m, i) => (
                    <div key={i} className="flex flex-col">
                      <span
                        className="text-4xl md:text-5xl font-normal font-mono"
                      >
                        {m.value}
                      </span>
                      <span
                        className="text-xs mt-1 font-body"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </RevealText>
            )}
            <RevealText delay={0.1}>
              <p
                className="text-base leading-relaxed max-w-[680px] font-body"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {project.outcome}
              </p>
            </RevealText>
          </div>
        </section>

        {/* Stack Breakdown */}
        <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <span className="section-label block mb-8">Stack Breakdown</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.stack.map((s, i) => (
                <RevealText key={s.name} delay={i * 0.06}>
                  <div
                    className="p-5 rounded-[2px]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-sub)',
                    }}
                  >
                    <h4
                      className="text-base font-medium mb-2 font-display"
                    >
                      {s.name}
                    </h4>
                    <p
                      className="text-sm leading-relaxed font-body"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {s.reason}
                    </p>
                  </div>
                </RevealText>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* More Work */}
        <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <span className="section-label block mb-8">More work</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherProjects.map(p => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </article>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="text-xs uppercase tracking-widest block mb-1 font-mono"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-body"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {value}
      </span>
    </div>
  )
}

function CaseSection({ label, content }: { label: string; content: string }) {
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <span className="section-label block mb-8">{label}</span>
        <RevealText>
          <p
            className="text-base leading-relaxed max-w-[680px] font-body"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {content}
          </p>
        </RevealText>
      </div>
    </section>
  )
}

function Divider() {
  return (
    <div className="px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto h-px" style={{ backgroundColor: 'var(--color-border-sub)' }} />
    </div>
  )
}
