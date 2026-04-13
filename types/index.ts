export interface Project {
  slug: string
  title: string
  client: string
  type: string
  year: string
  tags: string[]
  summary: string
  coverImage: string
  problem: string
  approach: string
  decisions: ProjectDecision[]
  outcome: string
  outcomeMetrics?: ProjectMetric[]
  stack: StackItem[]
  liveUrl?: string
  repoUrl?: string
}

export interface ProjectDecision {
  title: string
  description: string
}

export interface ProjectMetric {
  value: string
  label: string
}

export interface StackItem {
  name: string
  reason: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
}

export interface ProcessStep {
  number: string
  title: string
  description: string
}

export interface NavLink {
  label: string
  href: string
}
