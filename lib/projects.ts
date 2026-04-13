import type { Project } from '@/types'

/*
 * TODO — Before launch, verify or update:
 *  - liveUrl values: replace placeholder domains with real live URLs (or remove)
 *  - Contact.tsx / Nav.tsx: verify hello@musabaqeel.com email address
 */

export const projects: Project[] = [
  {
    slug: 'meridian-platform',
    title: 'Meridian Platform',
    client: 'Confidential',
    type: 'Full Stack Application',
    year: '2024',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    summary: 'A complete patient management and telehealth platform built from zero to production in three weeks. Real-time scheduling, video consultations, and automated billing integrated into a single dashboard.',
    coverImage: '/projects/meridian_img.webp',
    problem: 'The client was running patient scheduling through three separate tools, losing data between handoffs, and spending hours on manual billing reconciliation. Their previous vendor quoted six months for a unified platform.',
    approach: 'I started with the data model, not the UI. Mapped every patient touchpoint, identified where data was being duplicated or lost, and designed a single PostgreSQL schema that eliminated the redundancy. Built the frontend as a progressive dashboard that loaded only the context each user role needed.',
    decisions: [
      {
        title: 'PostgreSQL over a NoSQL alternative',
        description: 'Patient data has strong relational patterns and regulatory requirements around consistency. A document store would have created complexity at the query layer that was not worth the flexibility tradeoff.',
      },
      {
        title: 'Server Components for the dashboard shell',
        description: 'The dashboard layout, navigation, and role-based content gating all run as Server Components. Only the interactive widgets (calendar, video, chat) are client components. This cut the JavaScript payload by roughly 40% compared to a fully client-rendered approach.',
      },
      {
        title: 'WebRTC through a managed service',
        description: 'Building a custom WebRTC signaling server was out of scope for the timeline. I integrated a managed service and wrapped it in an abstraction layer so the client can swap providers later without touching the UI.',
      },
    ],
    outcome: 'Delivered in 19 days. The client consolidated three subscriptions into one platform, reduced scheduling errors to near zero, and cut their monthly tooling spend by 60%.',
    outcomeMetrics: [
      { value: '19', label: 'Days to launch' },
      { value: '60%', label: 'Cost reduction' },
      { value: '3x', label: 'Booking throughput' },
    ],
    stack: [
      { name: 'Next.js 14', reason: 'App Router for the dashboard, Server Components for data-heavy pages, API routes for internal services.' },
      { name: 'TypeScript', reason: 'End-to-end type safety across frontend, API layer, and database queries.' },
      { name: 'PostgreSQL', reason: 'Strong relational model for patient, appointment, and billing data with ACID guarantees.' },
      { name: 'Tailwind CSS', reason: 'Rapid iteration on a consistent design system without writing custom CSS for every component.' },
    ],
    liveUrl: 'https://meridian-platform.com',
    repoUrl: '',
  },
  {
    slug: 'aura-commerce',
    title: 'Aura Commerce',
    client: 'Confidential',
    type: 'E-commerce Platform',
    year: '2024',
    tags: ['Next.js', 'Shopify', 'GSAP', 'Framer Motion'],
    summary: 'A headless Shopify storefront for a premium lifestyle brand. Custom product configurator, smooth scroll experiences, and conversion-optimized checkout flow.',
    coverImage: '/projects/aura_img.webp',
    problem: 'The brand had outgrown their Shopify theme. The existing storefront was slow, could not support their product customization requirements, and did not reflect the premium positioning they needed for an international audience.',
    approach: 'Built a headless storefront on Next.js using the Shopify Storefront API. Designed the product pages around the customization flow first, then worked backwards to the browse and discovery experience. Every interaction was considered for both desktop and mobile from the start.',
    decisions: [
      {
        title: 'Headless over theme customization',
        description: 'The product configurator required real-time 3D previews and dynamic pricing calculations that Liquid templates could not support. Headless gave full control over the rendering pipeline.',
      },
      {
        title: 'ISR for product catalog pages',
        description: 'Product pages use Incremental Static Regeneration with a 60-second revalidation window. This gives near-static performance while keeping inventory and pricing current within a minute of any Shopify admin change.',
      },
    ],
    outcome: 'Launched to a 35% improvement in page load speed, 22% increase in conversion rate within the first month, and zero downtime during their biggest product launch to date.',
    outcomeMetrics: [
      { value: '35%', label: 'Faster load times' },
      { value: '22%', label: 'Conversion lift' },
      { value: '0', label: 'Launch downtime' },
    ],
    stack: [
      { name: 'Next.js', reason: 'ISR for product pages, API routes for cart operations, and full control over the rendering pipeline.' },
      { name: 'Shopify Storefront API', reason: 'Handles inventory, payments, and fulfillment without rebuilding commerce infrastructure.' },
      { name: 'GSAP + ScrollTrigger', reason: 'Scroll-driven product reveals and parallax effects that match the brand aesthetic.' },
      { name: 'Framer Motion', reason: 'Page transitions and micro-interactions for the configurator UI.' },
    ],
    liveUrl: 'https://aura-lifestyle.com',
    repoUrl: '',
  },
  {
    slug: 'nexus-dashboard',
    title: 'Nexus Dashboard',
    client: 'Confidential',
    type: 'SaaS Dashboard',
    year: '2023',
    tags: ['React', 'Node.js', 'D3.js', 'WebSocket'],
    summary: 'A real-time analytics dashboard processing 50,000+ events per minute. Live data visualization, custom alert rules, and team collaboration features built for a data infrastructure startup.',
    coverImage: '/projects/nexus_img.webp',
    problem: 'The startup had a powerful data pipeline but no way for their customers to interact with it visually. They needed a dashboard that could handle high-frequency data updates without degrading performance or usability.',
    approach: 'Designed the data flow architecture first. WebSocket connections deliver events to a client-side buffer that batches updates before hitting the rendering layer. D3.js handles the heavy visualization work while React manages the application shell and user interactions.',
    decisions: [
      {
        title: 'D3.js over a charting library',
        description: 'Off-the-shelf chart libraries could not handle the update frequency or the custom visualization types the client needed. D3 gave direct control over the rendering pipeline and allowed us to optimize for specific data patterns.',
      },
      {
        title: 'Client-side event buffering',
        description: 'Rather than rendering every WebSocket event immediately, events accumulate in a 100ms buffer and flush as a batch. This prevents DOM thrashing at high throughput while keeping the visual update cadence smooth enough to feel real-time.',
      },
    ],
    outcome: 'Handles 50K events per minute with sub-200ms visual latency. The client used the dashboard as a core differentiator in their Series A pitch.',
    outcomeMetrics: [
      { value: '50K+', label: 'Events per minute' },
      { value: '<200ms', label: 'Visual latency' },
      { value: 'Series A', label: 'Funded after launch' },
    ],
    stack: [
      { name: 'React', reason: 'Application shell, routing, and state management for collaborative features.' },
      { name: 'Node.js', reason: 'WebSocket server and event processing middleware.' },
      { name: 'D3.js', reason: 'Custom high-performance visualizations that no charting library could deliver.' },
      { name: 'WebSocket', reason: 'Bi-directional real-time communication for live event streaming and alert triggers.' },
    ],
    liveUrl: 'https://nexus-analytics.io',
    repoUrl: '',
  },
  {
    slug: 'vertex-studio',
    title: 'Vertex Studio',
    client: 'Confidential',
    type: 'Agency Website',
    year: '2023',
    tags: ['Next.js', 'GSAP', 'Webflow CMS', 'Tailwind CSS'],
    summary: 'A portfolio and case study site for a creative agency, featuring scroll-driven storytelling, rich animations, and a Webflow CMS backend for the non-technical team to manage content independently.',
    coverImage: '/projects/vertex_img.webp',
    problem: 'The agency needed a site that demonstrated their creative capabilities but could be updated by a team with no development experience. Previous attempts with page builders produced sites that looked generic and performed poorly.',
    approach: 'Built the frontend in Next.js with GSAP handling all scroll-driven animations and page transitions. Connected Webflow as a headless CMS so the team can manage projects, case studies, and blog posts through a visual editor without touching code.',
    decisions: [
      {
        title: 'Webflow CMS over a traditional headless CMS',
        description: 'The team was already comfortable with Webflow from a previous project. Using it as a headless CMS meant zero training overhead and a content editing experience they already understood.',
      },
      {
        title: 'GSAP for all scroll animations',
        description: 'The design called for pinned sections, horizontal scroll galleries, and parallax storytelling sequences. GSAP ScrollTrigger handles all of these with precise control and consistent performance.',
      },
    ],
    outcome: 'The agency reported a 40% increase in inbound leads within two months of launch. The content team publishes new case studies weekly without developer involvement.',
    outcomeMetrics: [
      { value: '40%', label: 'Lead increase' },
      { value: 'Weekly', label: 'Content updates' },
      { value: '95+', label: 'Lighthouse score' },
    ],
    stack: [
      { name: 'Next.js', reason: 'Static generation for marketing pages, dynamic routes for CMS-driven content.' },
      { name: 'GSAP + ScrollTrigger', reason: 'Complex scroll-driven animations and pinned storytelling sections.' },
      { name: 'Webflow CMS', reason: 'Visual content management for a non-technical team.' },
      { name: 'Tailwind CSS', reason: 'Consistent spacing and typography system across all pages.' },
    ],
    liveUrl: 'https://vertex-creative.com',
    repoUrl: '',
  },
]
