import type { ContactSubmission } from './types'

export const CONTACT_PROJECT_TYPES = [
  { value: 'build', label: 'Complete System Build' },
  { value: 'surgical', label: 'Surgical Fix / Optimization' },
  { value: 'architecture', label: 'Architecture & Scoping' },
  { value: 'other', label: "Other / Let's Discuss" },
] as const

export type ContactProjectTypeValue =
  (typeof CONTACT_PROJECT_TYPES)[number]['value']

// Inline structural constraint (not the named ContactBudgetOption interface)
// so the named interface below can reference ContactBudgetValue without
// creating a circular type dependency.
export const CONTACT_BUDGET_MAP = {
  build: [
    { value: '15k_30k', label: '$15k - $30k' },
    { value: '30k_plus', label: '$30k+' },
    { value: 'scoping', label: 'Needs Scoping' },
  ],
  surgical: [
    { value: 'under_3k', label: 'Under $3k (Scoped Fix)' },
    { value: '3k_10k', label: '$3k - $10k (Feature Addition)' },
    { value: 'retainer', label: 'Monthly Retainer' },
  ],
  architecture: [
    { value: 'flat_audit', label: 'Flat Rate Audit' },
    { value: 'hourly', label: 'Hourly Consultation' },
  ],
  other: [
    { value: 'under_5k', label: 'Under $5k' },
    { value: '5k_15k', label: '$5k - $15k' },
    { value: '15k_plus', label: '$15k+' },
  ],
} as const satisfies Record<
  ContactProjectTypeValue,
  ReadonlyArray<{ readonly value: string; readonly label: string }>
>

export type ContactBudgetValue =
  (typeof CONTACT_BUDGET_MAP)[ContactProjectTypeValue][number]['value']

export type ContactBudgetValueFor<T extends ContactProjectTypeValue> =
  (typeof CONTACT_BUDGET_MAP)[T][number]['value']

export interface ContactBudgetOption {
  readonly value: ContactBudgetValue
  readonly label: string
}

export const CONTACT_BUDGET_PLACEHOLDER_ENABLED = 'Select range'

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

export function isProjectTypeValue(
  value: string,
): value is ContactProjectTypeValue {
  return CONTACT_PROJECT_TYPES.some((option) => option.value === value)
}

export function getBudgetOptionsForProjectType<
  T extends ContactProjectTypeValue,
>(value: T): (typeof CONTACT_BUDGET_MAP)[T]
export function getBudgetOptionsForProjectType(
  value: string,
): ReadonlyArray<ContactBudgetOption>
export function getBudgetOptionsForProjectType(
  value: string,
): ReadonlyArray<ContactBudgetOption> {
  if (!isProjectTypeValue(value)) return []
  return CONTACT_BUDGET_MAP[value]
}

export function getProjectTypeLabel(value: ContactProjectTypeValue): string
export function getProjectTypeLabel(value: string): string | null
export function getProjectTypeLabel(value: string): string | null {
  return (
    CONTACT_PROJECT_TYPES.find((option) => option.value === value)?.label ??
    null
  )
}

export function getBudgetLabel<T extends ContactProjectTypeValue>(
  projectType: T,
  value: ContactBudgetValueFor<T>,
): string
export function getBudgetLabel(
  projectType: string,
  value: string,
): string | null
export function getBudgetLabel(
  projectType: string,
  value: string,
): string | null {
  return (
    getBudgetOptionsForProjectType(projectType).find(
      (option) => option.value === value,
    )?.label ?? null
  )
}

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
