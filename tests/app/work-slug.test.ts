import { describe, expect, it } from 'vitest'

import { generateMetadata, generateStaticParams } from '@/app/work/[slug]/page'
import { PAGE_TITLE_NOT_FOUND } from '@/lib/config'
import { getAllProjects, getProjectSlugs } from '@/lib/projects'

describe('work/[slug] route generation', () => {
  it('prerenders one static param per project slug', async () => {
    const params = await generateStaticParams()

    expect(params).toEqual(getProjectSlugs().map((slug) => ({ slug })))
  })

  it('builds canonical metadata from the project for a known slug', async () => {
    const project = getAllProjects()[0]

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: project.slug }),
    })

    expect(metadata.title).toBe(project.title)
    expect(metadata.description).toBe(project.summary)
    expect(metadata.alternates?.canonical).toBe(`/work/${project.slug}`)
  })

  it('returns non-indexable not-found metadata for an unknown slug', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'does-not-exist' }),
    })

    expect(metadata.title).toBe(PAGE_TITLE_NOT_FOUND)
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
