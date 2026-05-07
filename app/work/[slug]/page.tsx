import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CaseStudy from '@/components/work/CaseStudy'
import Footer from '@/components/layout/Footer'
import { PAGE_TITLE_NOT_FOUND } from '@/lib/config'
import { getProjectBySlug, getProjectSlugs } from '@/lib/projects'
import { projectJsonLd } from '@/lib/structured-data'

interface Props {
  params: Promise<{ slug: string }>
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) {
    return {
      title: PAGE_TITLE_NOT_FOUND,
      robots: { index: false, follow: false },
    }
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `/work/${project.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.summary,
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) notFound()

  const jsonLd = projectJsonLd(project)

  return (
    <>
      <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>
      <CaseStudy project={project} />
      <Footer />
    </>
  )
}
