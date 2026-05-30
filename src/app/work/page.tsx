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
  // OG/Twitter images are supplied by the file-based conventions in this route
  // (work/opengraph-image.tsx, work/twitter-image.tsx), so they aren't set here.
  openGraph: {
    title: PAGE_TITLE_WORK,
    description: workDescription,
    url: '/work',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE_WORK,
    description: workDescription,
  },
}

export default function WorkIndexPage() {
  const projects = getAllProjects()

  return (
    <>
      <section className="px-6 pt-32 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-350">
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
