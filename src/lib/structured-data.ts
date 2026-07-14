import {
  COMPANY_NAME,
  JOB_TITLE,
  SITE_DOMAIN,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from '@/lib/config'
import type { Project } from '@/types'

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: JOB_TITLE,
  description:
    'Full stack developer and studio founder delivering complete builds from design to deployment in weeks.',
  knowsAbout: [
    'Web Development',
    'Full Stack Development',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'E-commerce',
    'UI Engineering',
    'System Architecture',
  ],
  sameAs: SOCIAL_LINKS.map(({ href }) => href),
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PK',
  },
  // No `url`: the org URL is not the personal portfolio, and pointing it here
  // misattributes the organization. Omit until a real org URL exists.
  worksFor: {
    '@type': 'Organization',
    name: COMPANY_NAME,
  },
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: `Portfolio of ${SITE_NAME} - full stack developer, architect, and operator.`,
  author: {
    '@type': 'Person',
    name: SITE_NAME,
  },
}

export function projectJsonLd(
  project: Pick<
    Project,
    'title' | 'summary' | 'coverImage' | 'tags' | 'year' | 'slug'
  >,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    image: `${SITE_URL}${project.coverImage}`,
    url: `${SITE_URL}/work/${project.slug}`,
    keywords: project.tags.join(', '),
    creator: {
      '@type': 'Person',
      name: SITE_NAME,
    },
  }
}
