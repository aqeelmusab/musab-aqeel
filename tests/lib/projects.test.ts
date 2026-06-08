import { describe, expect, it } from 'vitest'

import {
  getAllProjects,
  getFeaturedProjects,
  getOtherProjects,
  getProjectBySlug,
  getProjectSlugs,
} from '@/lib/projects'

const REQUIRED_STRING_FIELDS = [
  'slug',
  'title',
  'client',
  'type',
  'year',
  'summary',
  'coverImage',
  'problem',
  'approach',
  'outcome',
] as const

describe('project data invariants', () => {
  it('exposes at least one project', () => {
    expect(getAllProjects().length).toBeGreaterThan(0)
  })

  it('has a unique slug for every project', () => {
    const slugs = getProjectSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses url-safe slugs', () => {
    for (const slug of getProjectSlugs()) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('populates the required display fields on every project', () => {
    for (const project of getAllProjects()) {
      for (const field of REQUIRED_STRING_FIELDS) {
        expect(
          typeof project[field] === 'string' && project[field].length > 0,
        ).toBe(true)
      }

      expect(project.tags.length).toBeGreaterThan(0)
      expect(project.decisions.length).toBeGreaterThan(0)
      expect(project.stack.length).toBeGreaterThan(0)
      expect(project.coverImage.startsWith('/')).toBe(true)
    }
  })

  it('uses valid URLs when optional links are present', () => {
    for (const project of getAllProjects()) {
      if (project.liveUrl) {
        expect(() => new URL(project.liveUrl as string)).not.toThrow()
      }

      if (project.repoUrl) {
        expect(() => new URL(project.repoUrl as string)).not.toThrow()
      }
    }
  })
})

describe('project lookups', () => {
  it('getProjectBySlug returns the project matching the slug', () => {
    for (const project of getAllProjects()) {
      expect(getProjectBySlug(project.slug)).toBe(project)
    }
  })

  it('getProjectBySlug returns undefined for an unknown slug', () => {
    expect(getProjectBySlug('does-not-exist')).toBeUndefined()
  })

  it('getProjectSlugs returns every project slug in order', () => {
    expect(getProjectSlugs()).toEqual(getAllProjects().map((p) => p.slug))
  })
})

describe('project collections', () => {
  it('getFeaturedProjects respects the requested limit', () => {
    const total = getAllProjects().length

    expect(getFeaturedProjects(2)).toHaveLength(Math.min(2, total))
    expect(getFeaturedProjects(0)).toHaveLength(0)
    expect(getFeaturedProjects(total + 5)).toHaveLength(total)
  })

  it('getFeaturedProjects defaults to the first three projects', () => {
    expect(getFeaturedProjects()).toEqual(getAllProjects().slice(0, 3))
  })

  it('getOtherProjects excludes the current project', () => {
    const [first] = getAllProjects()
    if (!first) throw new Error('Expected at least one project')
    const others = getOtherProjects(first.slug)

    expect(others.every((project) => project.slug !== first.slug)).toBe(true)
  })

  it('getOtherProjects respects the requested limit', () => {
    const [first] = getAllProjects()
    if (!first) throw new Error('Expected at least one project')

    expect(getOtherProjects(first.slug, 1)).toHaveLength(1)
  })
})
