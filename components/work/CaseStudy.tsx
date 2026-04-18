'use client'

import { motion } from 'motion/react'
import RevealText from '@/components/ui/RevealText'
import Tag from '@/components/ui/Tag'
import ProjectCard from '@/components/work/ProjectCard'
import {
  ProjectCoverImage,
  WorkDivider,
  WorkSection,
} from '@/components/work/primitives'
import { ease } from '@/lib/motion'
import { getOtherProjects } from '@/lib/projects'
import type { Project } from '@/types'

interface CaseStudyProps {
  project: Project
}

export default function CaseStudy({ project }: CaseStudyProps) {
  const otherProjects = getOtherProjects(project.slug)

  return (
    <article>
      {/* Hero image */}
      <ProjectCoverImage
        project={project}
        aspectClassName="aspect-16/8 w-full"
        imageClassName="transition-opacity duration-500"
        overlayStyle={{
          background:
            'linear-gradient(to top, var(--color-bg) 0%, transparent 50%)',
        }}
        priority
        sizes="(max-width: 768px) 100vw, 100vw"
      >
        <div className="absolute bottom-8 left-6 md:left-12 lg:left-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: ease.out, delay: 0.3 }}
            className="mb-2 font-mono text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {project.type} / {project.year}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.out, delay: 0.35 }}
            className="font-display text-3xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
          >
            {project.title}
          </motion.h1>
        </div>
      </ProjectCoverImage>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ease.out, delay: 0.45 }}
      >
        {/* Overview */}
        <WorkSection containerClassName="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p
              className="font-body text-xl leading-relaxed"
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
                className="mb-2 block font-mono text-xs tracking-widest uppercase"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body mt-2 inline-flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                View live ↗
              </a>
            )}
          </div>
        </WorkSection>

        <WorkDivider />

        {/* Problem */}
        <CaseSection label="Problem" content={project.problem} />

        {/* Approach */}
        <CaseSection label="Approach" content={project.approach} />

        {/* Key Decisions */}
        <WorkSection>
          <span className="section-label mb-8 block">Key Decisions</span>
          <div className="flex flex-col gap-10">
            {project.decisions.map((d, i) => (
              <RevealText key={d.title} delay={i * 0.08}>
                <h3 className="font-display mb-3 text-xl font-medium tracking-tight md:text-2xl">
                  {d.title}
                </h3>
                <p
                  className="font-body max-w-[680px] text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {d.description}
                </p>
              </RevealText>
            ))}
          </div>
        </WorkSection>

        {/* Outcome */}
        <WorkSection>
          <span className="section-label mb-8 block">Outcome</span>
          {project.outcomeMetrics && (
            <RevealText>
              <div className="mb-10 flex flex-wrap items-center gap-10 md:gap-16">
                {project.outcomeMetrics.map((m) => (
                  <div key={m.label} className="flex flex-col">
                    <span className="font-mono text-4xl font-normal md:text-5xl">
                      {m.value}
                    </span>
                    <span
                      className="font-body mt-1 text-xs"
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
              className="font-body max-w-[680px] text-base leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {project.outcome}
            </p>
          </RevealText>
        </WorkSection>

        {/* Stack Breakdown */}
        <WorkSection>
          <span className="section-label mb-8 block">Stack Breakdown</span>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {project.stack.map((s, i) => (
              <RevealText key={s.name} delay={i * 0.06}>
                <div
                  className="rounded-[2px] p-5"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-sub)',
                  }}
                >
                  <h4 className="font-display mb-2 text-base font-medium">
                    {s.name}
                  </h4>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {s.reason}
                  </p>
                </div>
              </RevealText>
            ))}
          </div>
        </WorkSection>

        <WorkDivider />

        {/* More Work */}
        <WorkSection>
          <span className="section-label mb-8 block">More work</span>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {otherProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </WorkSection>
      </motion.div>
    </article>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="mb-1 block font-mono text-xs tracking-widest uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </span>
      <span
        className="font-body text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {value}
      </span>
    </div>
  )
}

function CaseSection({ label, content }: { label: string; content: string }) {
  return (
    <WorkSection>
      <span className="section-label mb-8 block">{label}</span>
      <RevealText>
        <p
          className="font-body max-w-[680px] text-base leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {content}
        </p>
      </RevealText>
    </WorkSection>
  )
}
