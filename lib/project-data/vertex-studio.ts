import type { Project } from '@/types'

export const vertexStudioProject: Project = {
  slug: 'vertex-studio',
  title: 'Vertex Studio',
  client: 'Confidential',
  type: 'Agency Website',
  year: '2023',
  tags: ['Next.js', 'GSAP', 'Webflow CMS', 'Tailwind CSS'],
  summary:
    'A portfolio and case study site for a creative agency, featuring scroll-driven storytelling, rich animations, and a Webflow CMS backend for the non-technical team to manage content independently.',
  coverImage: '/projects/vertex_img.webp',
  problem:
    'The agency needed a site that demonstrated their creative capabilities but could be updated by a team with no development experience. Previous attempts with page builders produced sites that looked generic and performed poorly.',
  approach:
    'Built the frontend in Next.js with GSAP handling all scroll-driven animations and page transitions. Connected Webflow as a headless CMS so the team can manage projects, case studies, and blog posts through a visual editor without touching code.',
  decisions: [
    {
      title: 'Webflow CMS over a traditional headless CMS',
      description:
        'The team was already comfortable with Webflow from a previous project. Using it as a headless CMS meant zero training overhead and a content editing experience they already understood.',
    },
    {
      title: 'GSAP for all scroll animations',
      description:
        'The design called for pinned sections, horizontal scroll galleries, and parallax storytelling sequences. GSAP ScrollTrigger handles all of these with precise control and consistent performance.',
    },
  ],
  outcome:
    'The agency reported a 40% increase in inbound leads within two months of launch. The content team publishes new case studies weekly without developer involvement.',
  outcomeMetrics: [
    { value: '40%', label: 'Lead increase' },
    { value: 'Weekly', label: 'Content updates' },
    { value: '95+', label: 'Lighthouse score' },
  ],
  stack: [
    {
      name: 'Next.js',
      reason:
        'Static generation for marketing pages, dynamic routes for CMS-driven content.',
    },
    {
      name: 'GSAP + ScrollTrigger',
      reason:
        'Complex scroll-driven animations and pinned storytelling sections.',
    },
    {
      name: 'Webflow CMS',
      reason: 'Visual content management for a non-technical team.',
    },
    {
      name: 'Tailwind CSS',
      reason: 'Consistent spacing and typography system across all pages.',
    },
  ],
  liveUrl: 'https://vertex-creative.com',
  repoUrl: 'https://github.com/musabaqeel/vertex-studio',
}
