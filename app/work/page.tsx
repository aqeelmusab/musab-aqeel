import ProjectCard from '@/components/work/ProjectCard'
import Footer from '@/components/layout/Footer'
import BackButton from '@/components/ui/BackButton'
import { PAGE_TITLE_WORK } from '@/lib/config'
import { getAllProjects } from '@/lib/projects'
import type { Metadata } from 'next'

const workDescription =
  'Full stack projects spanning SaaS platforms, e-commerce, real-time dashboards, and agency websites. Each built solo, start to finish.'

export const metadata: Metadata = {
  title: PAGE_TITLE_WORK,
  description: workDescription,
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: PAGE_TITLE_WORK,
    description: workDescription,
    url: '/work',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE_WORK,
    description: workDescription,
    images: ['/twitter-image'],
  },
}

export default function WorkIndexPage() {
  const projects = getAllProjects()

  return (
    <>
      <section className="px-6 pt-32 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <BackButton />
          <h1 className="font-display mb-16 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Work
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
