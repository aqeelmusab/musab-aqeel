import { describe, expect, it } from 'vitest'

import { generateStaticParams } from '@/app/work/[slug]/page'
import { getProjectSlugs } from '@/lib/projects'

describe('work project page static params', () => {
  it('matches project slugs', async () => {
    await expect(generateStaticParams()).resolves.toEqual(
      getProjectSlugs().map((slug) => ({ slug })),
    )
  })
})
