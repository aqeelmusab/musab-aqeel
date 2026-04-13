import { SITE_URL } from '@/lib/config'

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Musab Aqeel',
  url: SITE_URL,
  jobTitle: 'Full Stack Developer',
  description: 'Full stack developer and studio founder delivering complete builds from design to deployment in weeks.',
  knowsAbout: [
    'Web Development', 'Full Stack Development', 'React', 'Next.js', 'TypeScript',
    'Node.js', 'PostgreSQL', 'E-commerce', 'UI Engineering', 'System Architecture',
  ],
  sameAs: [
    'https://github.com/aqeelspark',
    'https://linkedin.com/in/aqeelmusab',
    'https://x.com/aqeelmusab',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PK',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Dupixo',
    url: SITE_URL,
  },
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Musab Aqeel',
  alternateName: ['Musab Aqeel', 'musabaqeel.com'],
  url: SITE_URL,
  description: 'Portfolio of Musab Aqeel — full stack developer, architect, and operator.',
  author: {
    '@type': 'Person',
    name: 'Musab Aqeel',
  },
}

export function projectJsonLd(project: {
  title: string
  summary: string
  coverImage: string
  tags: string[]
  year: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    image: `${SITE_URL}${project.coverImage}`,
    url: `${SITE_URL}/work/${project.slug}`,
    dateCreated: project.year,
    keywords: project.tags.join(', '),
    creator: {
      '@type': 'Person',
      name: 'Musab Aqeel',
    },
  }
}
