import {
  auraCommerceProject,
  meridianPlatformProject,
  nexusDashboardProject,
  vertexStudioProject,
} from '@/lib/project-data'
import type { Project } from '@/types'

export const projects: readonly Project[] = [
  meridianPlatformProject,
  auraCommerceProject,
  nexusDashboardProject,
  vertexStudioProject,
]

export function getAllProjects(): readonly Project[] {
  return projects
}

export function getFeaturedProjects(limit = 3): readonly Project[] {
  return projects.slice(0, limit)
}

export function getOtherProjects(
  currentSlug: string,
  limit = 2,
): readonly Project[] {
  return projects
    .filter((project) => project.slug !== currentSlug)
    .slice(0, limit)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getProjectSlugs(): string[] {
  return projects.map((project) => project.slug)
}
