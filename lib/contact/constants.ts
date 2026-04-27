import type { ContactSubmission } from './types'

export const CONTACT_BUDGET_OPTIONS = [
  'Under $1k',
  '$1k - $5k',
  '$5k - $15k',
  '$15k+',
  "Let's discuss",
] as const

export const CONTACT_PROJECT_TYPES = [
  'Full Stack Build',
  'Landing Page',
  'Design System',
  'Consultation',
  'Other',
] as const

export const CONTACT_HONEYPOT_FIELD_NAME = 'website'

export const CONTACT_MAX_NAME_LENGTH = 100
export const CONTACT_MAX_EMAIL_LENGTH = 320
export const CONTACT_MAX_BUDGET_LENGTH = 50
export const CONTACT_MAX_PROJECT_TYPE_LENGTH = 80
export const CONTACT_MAX_MESSAGE_LENGTH = 4_000

export const CONTACT_MIN_SUBMISSION_TIME_MS = 1_500
export const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5
export const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000
export const CONTACT_WEBHOOK_TIMEOUT_MS = 10_000

export function createEmptyContactSubmission(
  startedAt = Date.now(),
): ContactSubmission {
  return {
    name: '',
    email: '',
    budget: '',
    projectType: '',
    message: '',
    website: '',
    startedAt,
  }
}
