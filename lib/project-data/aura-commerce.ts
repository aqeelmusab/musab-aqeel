import type { Project } from '@/types'

export const auraCommerceProject: Project = {
  slug: 'aura-commerce',
  title: 'Aura Commerce',
  client: 'Confidential',
  type: 'E-commerce Platform',
  year: '2024',
  tags: ['Next.js', 'Shopify', 'GSAP', 'Framer Motion'],
  summary:
    'A headless Shopify storefront for a premium lifestyle brand. Custom product configurator, smooth scroll experiences, and conversion-optimized checkout flow.',
  coverImage: '/projects/aura_img.webp',
  problem:
    'The brand had outgrown their Shopify theme. The existing storefront was slow, could not support their product customization requirements, and did not reflect the premium positioning they needed for an international audience.',
  approach:
    'Built a headless storefront on Next.js using the Shopify Storefront API. Designed the product pages around the customization flow first, then worked backwards to the browse and discovery experience. Every interaction was considered for both desktop and mobile from the start.',
  decisions: [
    {
      title: 'Headless over theme customization',
      description:
        'The product configurator required real-time 3D previews and dynamic pricing calculations that Liquid templates could not support. Headless gave full control over the rendering pipeline.',
    },
    {
      title: 'ISR for product catalog pages',
      description:
        'Product pages use Incremental Static Regeneration with a 60-second revalidation window. This gives near-static performance while keeping inventory and pricing current within a minute of any Shopify admin change.',
    },
  ],
  outcome:
    'Launched to a 35% improvement in page load speed, 22% increase in conversion rate within the first month, and zero downtime during their biggest product launch to date.',
  outcomeMetrics: [
    { value: '35%', label: 'Faster load times' },
    { value: '22%', label: 'Conversion lift' },
    { value: '0', label: 'Launch downtime' },
  ],
  stack: [
    {
      name: 'Next.js',
      reason:
        'ISR for product pages, API routes for cart operations, and full control over the rendering pipeline.',
    },
    {
      name: 'Shopify Storefront API',
      reason:
        'Handles inventory, payments, and fulfillment without rebuilding commerce infrastructure.',
    },
    {
      name: 'GSAP + ScrollTrigger',
      reason:
        'Scroll-driven product reveals and parallax effects that match the brand aesthetic.',
    },
    {
      name: 'Framer Motion',
      reason:
        'Page transitions and micro-interactions for the configurator UI.',
    },
  ],
  liveUrl: 'https://aura-lifestyle.com',
  repoUrl: 'https://github.com/musabaqeel/aura-commerce',
}
