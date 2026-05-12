import {
  CONTACT_MAX_BUDGET_LENGTH,
  CONTACT_MAX_EMAIL_LENGTH,
  CONTACT_MAX_MESSAGE_LENGTH,
  CONTACT_MAX_NAME_LENGTH,
  CONTACT_MAX_PROJECT_TYPE_LENGTH,
  getBudgetLabel,
  getProjectTypeLabel,
} from './constants'
import type { ContactApiErrorCode, ParsedContactSubmission } from './types'

type ContactValidationFailureCode = Extract<
  ContactApiErrorCode,
  'invalid_payload' | 'missing_fields' | 'invalid_email' | 'invalid_timestamp'
>

type ContactValidationResult =
  | {
      success: true
      data: ParsedContactSubmission
    }
  | {
      success: false
      status: 400
      code: ContactValidationFailureCode
      error: string
    }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/

function fail(
  error: string,
  code: ContactValidationFailureCode,
): ContactValidationResult {
  return {
    success: false,
    status: 400,
    code,
    error,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeMultiline(value: string): string {
  return value.replace(/\r\n/g, '\n').trim()
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]
  return typeof value === 'string' ? value : null
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export function parseContactSubmission(
  value: unknown,
): ContactValidationResult {
  if (!isRecord(value)) {
    return fail('Invalid contact form payload.', 'invalid_payload')
  }

  const rawName = readString(value, 'name')
  const rawEmail = readString(value, 'email')
  const rawBudget = readString(value, 'budget')
  const rawProjectType = readString(value, 'projectType')
  const rawMessage = readString(value, 'message')
  const rawWebsite = readString(value, 'website') ?? ''
  const startedAt = readNumber(value, 'startedAt')

  if (
    rawName === null ||
    rawEmail === null ||
    rawBudget === null ||
    rawProjectType === null ||
    rawMessage === null
  ) {
    return fail('Invalid contact form payload.', 'invalid_payload')
  }

  if (startedAt === null || startedAt <= 0) {
    return fail('Please refresh the page and try again.', 'invalid_timestamp')
  }

  const name = normalizeSingleLine(rawName)
  const email = normalizeSingleLine(rawEmail).toLowerCase()
  const budgetValue = normalizeSingleLine(rawBudget)
  const projectTypeValue = normalizeSingleLine(rawProjectType)
  const message = normalizeMultiline(rawMessage)
  const honeypotValue = normalizeSingleLine(rawWebsite)

  if (!name || !email || !budgetValue || !projectTypeValue || !message) {
    return fail('Please complete all required fields.', 'missing_fields')
  }

  if (!EMAIL_PATTERN.test(email)) {
    return fail('Please enter a valid email address.', 'invalid_email')
  }

  if (
    name.length > CONTACT_MAX_NAME_LENGTH ||
    email.length > CONTACT_MAX_EMAIL_LENGTH ||
    budgetValue.length > CONTACT_MAX_BUDGET_LENGTH ||
    projectTypeValue.length > CONTACT_MAX_PROJECT_TYPE_LENGTH ||
    message.length > CONTACT_MAX_MESSAGE_LENGTH
  ) {
    return fail(
      'One or more fields exceed the allowed length.',
      'invalid_payload',
    )
  }

  const projectTypeLabel = getProjectTypeLabel(projectTypeValue)
  if (projectTypeLabel === null) {
    return fail('Please choose a valid project type.', 'invalid_payload')
  }

  const budgetLabel = getBudgetLabel(projectTypeValue, budgetValue)
  if (budgetLabel === null) {
    return fail('Please choose a valid budget range.', 'invalid_payload')
  }

  return {
    success: true,
    data: {
      payload: {
        name,
        email,
        budget: budgetLabel,
        projectType: projectTypeLabel,
        message,
      },
      metadata: {
        honeypotValue,
        startedAt,
      },
    },
  }
}
