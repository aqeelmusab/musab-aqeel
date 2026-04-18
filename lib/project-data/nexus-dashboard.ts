import type { Project } from '@/types'

export const nexusDashboardProject: Project = {
  slug: 'nexus-dashboard',
  title: 'Nexus Dashboard',
  client: 'Confidential',
  type: 'SaaS Dashboard',
  year: '2023',
  tags: ['React', 'Node.js', 'D3.js', 'WebSocket'],
  summary:
    'A real-time analytics dashboard processing 50,000+ events per minute. Live data visualization, custom alert rules, and team collaboration features built for a data infrastructure startup.',
  coverImage: '/projects/nexus_img.webp',
  problem:
    'The startup had a powerful data pipeline but no way for their customers to interact with it visually. They needed a dashboard that could handle high-frequency data updates without degrading performance or usability.',
  approach:
    'Designed the data flow architecture first. WebSocket connections deliver events to a client-side buffer that batches updates before hitting the rendering layer. D3.js handles the heavy visualization work while React manages the application shell and user interactions.',
  decisions: [
    {
      title: 'D3.js over a charting library',
      description:
        'Off-the-shelf chart libraries could not handle the update frequency or the custom visualization types the client needed. D3 gave direct control over the rendering pipeline and allowed us to optimize for specific data patterns.',
    },
    {
      title: 'Client-side event buffering',
      description:
        'Rather than rendering every WebSocket event immediately, events accumulate in a 100ms buffer and flush as a batch. This prevents DOM thrashing at high throughput while keeping the visual update cadence smooth enough to feel real-time.',
    },
  ],
  outcome:
    'Handles 50K events per minute with sub-200ms visual latency. The client used the dashboard as a core differentiator in their Series A pitch.',
  outcomeMetrics: [
    { value: '50K+', label: 'Events per minute' },
    { value: '<200ms', label: 'Visual latency' },
    { value: 'Series A', label: 'Funded after launch' },
  ],
  stack: [
    {
      name: 'React',
      reason:
        'Application shell, routing, and state management for collaborative features.',
    },
    {
      name: 'Node.js',
      reason: 'WebSocket server and event processing middleware.',
    },
    {
      name: 'D3.js',
      reason:
        'Custom high-performance visualizations that no charting library could deliver.',
    },
    {
      name: 'WebSocket',
      reason:
        'Bi-directional real-time communication for live event streaming and alert triggers.',
    },
  ],
  liveUrl: 'https://nexus-analytics.io',
  repoUrl: 'https://github.com/musabaqeel/nexus-dashboard',
}
