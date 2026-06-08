import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/config'
import { getProjectSlugs } from '@/lib/projects'

describe('sitemap', () => {
  it('returns stable route metadata without fabricated timestamps', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/work`,
      ...getProjectSlugs().map((slug) => `${SITE_URL}/work/${slug}`),
    ])

    for (const entry of entries) {
      expect(entry).not.toHaveProperty('lastModified')
    }
  })

  it('includes the home and /work routes built from the configured site URL', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toContain(SITE_URL)
    expect(urls).toContain(`${SITE_URL}/work`)
    for (const url of urls) {
      expect(url.startsWith(SITE_URL)).toBe(true)
    }
  })

  it('includes exactly one /work/[slug] route per project slug', () => {
    const urls = sitemap().map((entry) => entry.url)
    const slugs = getProjectSlugs()

    for (const slug of slugs) {
      expect(urls).toContain(`${SITE_URL}/work/${slug}`)
    }

    const workRoutes = urls.filter((url) => url.startsWith(`${SITE_URL}/work/`))
    expect(workRoutes).toHaveLength(slugs.length)
  })
})
