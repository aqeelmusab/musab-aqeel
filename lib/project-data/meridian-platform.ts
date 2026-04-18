import type { Project } from '@/types'

export const meridianPlatformProject: Project = {
  slug: 'meridian-platform',
  title: 'Meridian Platform',
  client: 'Confidential',
  type: 'Full Stack Application',
  year: '2024',
  tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
  summary:
    'A complete patient management and telehealth platform built from zero to production in three weeks. Real-time scheduling, video consultations, and automated billing integrated into a single dashboard.',
  coverImage: '/projects/meridian_img.webp',
  problem:
    'The client was running patient scheduling through three separate tools, losing data between handoffs, and spending hours on manual billing reconciliation. Their previous vendor quoted six months for a unified platform.',
  approach:
    'I started with the data model, not the UI. Mapped every patient touchpoint, identified where data was being duplicated or lost, and designed a single PostgreSQL schema that eliminated the redundancy. Built the frontend as a progressive dashboard that loaded only the context each user role needed.',
  decisions: [
    {
      title: 'PostgreSQL over a NoSQL alternative',
      description:
        'Patient data has strong relational patterns and regulatory requirements around consistency. A document store would have created complexity at the query layer that was not worth the flexibility tradeoff.',
    },
    {
      title: 'Server Components for the dashboard shell',
      description:
        'The dashboard layout, navigation, and role-based content gating all run as Server Components. Only the interactive widgets (calendar, video, chat) are client components. This cut the JavaScript payload by roughly 40% compared to a fully client-rendered approach.',
    },
    {
      title: 'WebRTC through a managed service',
      description:
        'Building a custom WebRTC signaling server was out of scope for the timeline. I integrated a managed service and wrapped it in an abstraction layer so the client can swap providers later without touching the UI.',
    },
  ],
  outcome:
    'Delivered in 19 days. The client consolidated three subscriptions into one platform, reduced scheduling errors to near zero, and cut their monthly tooling spend by 60%.',
  outcomeMetrics: [
    { value: '19', label: 'Days to launch' },
    { value: '60%', label: 'Cost reduction' },
    { value: '3x', label: 'Booking throughput' },
  ],
  stack: [
    {
      name: 'Next.js 14',
      reason:
        'App Router for the dashboard, Server Components for data-heavy pages, API routes for internal services.',
    },
    {
      name: 'TypeScript',
      reason:
        'End-to-end type safety across frontend, API layer, and database queries.',
    },
    {
      name: 'PostgreSQL',
      reason:
        'Strong relational model for patient, appointment, and billing data with ACID guarantees.',
    },
    {
      name: 'Tailwind CSS',
      reason:
        'Rapid iteration on a consistent design system without writing custom CSS for every component.',
    },
  ],
  liveUrl: 'https://meridian-platform.com',
  repoUrl: 'https://github.com/musabaqeel/meridian-platform',
}
