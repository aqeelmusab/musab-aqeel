import ProjectCard from '@/components/work/ProjectCard'
import Footer from '@/components/layout/Footer'
import BackButton from '@/components/ui/BackButton'
import { projects } from '@/lib/projects'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work - Selected Projects & Case Studies',
  description: 'Full stack projects spanning SaaS platforms, e-commerce, real-time dashboards, and agency websites. Each built solo, start to finish.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Work - Selected Projects & Case Studies',
    description: 'Full stack projects spanning SaaS platforms, e-commerce, real-time dashboards, and agency websites.',
    url: '/work',
  },
}

export default function WorkIndexPage() {
  return (
    <>
      <section className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <BackButton />
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-16 font-display"
          >
            All work
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
