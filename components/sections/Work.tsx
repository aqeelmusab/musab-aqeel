import Link from 'next/link'
import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'
import ProjectCard from '@/components/work/ProjectCard'
import { getFeaturedProjects } from '@/lib/projects'

export default function Work() {
  const featuredProjects = getFeaturedProjects()
  const featured = featuredProjects[0]
  const rest = featuredProjects.slice(1)

  if (!featured) return null

  return (
    <section id="work" className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <RevealText>
              <span className="section-label mb-4 block">{'// 02 Work'}</span>
            </RevealText>
            <SplitText
              as="h2"
              className="font-display text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
            >
              Selected projects
            </SplitText>
          </div>
          <RevealText delay={0.1}>
            <Link
              href="/work"
              className="font-body hidden items-center gap-2 text-sm md:flex"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </RevealText>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RevealText className="md:col-span-2" delay={0.05}>
            <ProjectCard project={featured} />
          </RevealText>

          {rest.map((project, i) => (
            <RevealText key={project.slug} delay={0.1 + i * 0.06}>
              <ProjectCard project={project} />
            </RevealText>
          ))}
        </div>

        {/* Mobile-only bottom button */}
        <RevealText delay={0.2} className="mt-8 md:hidden">
          <Link href="/work" className="btn-outline w-full text-center">
            View all projects
          </Link>
        </RevealText>
      </div>
    </section>
  )
}
