import { SITE_TITLE } from '@/lib/config'
import {
  createHomeSocialImage,
  SOCIAL_IMAGE_CONTENT_TYPE,
  SOCIAL_IMAGE_SIZE,
} from '@/lib/social-image'

export const runtime = 'edge'
export const alt = SITE_TITLE
export const size = SOCIAL_IMAGE_SIZE
export const contentType = SOCIAL_IMAGE_CONTENT_TYPE

export default function OGImage() {
  return createHomeSocialImage()
}
