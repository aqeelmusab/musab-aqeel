import type { SocialLink } from '@/types'

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://musabaqeel.com'

export const SITE_URL = rawSiteUrl.endsWith('/')
  ? rawSiteUrl.slice(0, -1)
  : rawSiteUrl
export const SITE_NAME = 'Musab Aqeel'
// Derived from SITE_URL so preview/staging deploys show the right host in OG
// badges, the 404 footer, and JSON-LD instead of always the production domain.
export const SITE_DOMAIN = new URL(SITE_URL).hostname
export const SITE_TITLE = `${SITE_NAME} | Full stack developer, architect & operator`
export const SITE_SHORT_TITLE = `${SITE_NAME} | Full stack developer`

/** Shown in the tab; root `layout` appends ` | ${SITE_NAME}` via the title template. */
export const PAGE_TITLE_WORK = 'Work'
export const PAGE_TITLE_NOT_FOUND = 'Page not found'
export const JOB_TITLE = 'Full Stack Developer'
export const COMPANY_NAME = 'Dupixo'
export const TWITTER_HANDLE = '@aqeelmusab'
export const CONTACT_EMAIL = 'hello@musabaqeel.com'
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/aqeelmusab',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/19295664609?text=Musab%2C%20I%20have%20a%20new%20build%20ready%20for%20scoping.%20I%27ll%20drop%20the%20details%20below%3A',
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/aqeelmusab',
  },
]
