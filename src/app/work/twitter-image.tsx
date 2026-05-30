import { PAGE_TITLE_WORK, SITE_NAME } from '@/lib/config'
import {
  createWorkSocialImage,
  SOCIAL_IMAGE_CONTENT_TYPE,
  SOCIAL_IMAGE_SIZE,
} from '@/lib/SocialImage'

export const alt = `${PAGE_TITLE_WORK} | ${SITE_NAME}`
export const size = SOCIAL_IMAGE_SIZE
export const contentType = SOCIAL_IMAGE_CONTENT_TYPE

export default function TwitterImage() {
  return createWorkSocialImage()
}
