import { getProjectBySlug } from '@/lib/projects'
import {
  createProjectSocialImage,
  SOCIAL_IMAGE_CONTENT_TYPE,
  SOCIAL_IMAGE_SIZE,
} from '@/lib/social-image'

export const runtime = 'edge'
export const size = SOCIAL_IMAGE_SIZE
export const contentType = SOCIAL_IMAGE_CONTENT_TYPE
export const alt = 'Project case study by Musab Aqeel'

export default async function ProjectOGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  const title = project?.title ?? 'Project'
  const type = project?.type ?? 'Case Study'
  const tagList = project?.tags?.slice(0, 4) ?? []

  return createProjectSocialImage({
    title,
    type,
    tags: tagList,
  })
}
