import type {
  ContactApiErrorCode,
  ContactApiResponse,
  ContactSubmission,
} from './types'

/**
 * Client-side guard so the contact form UI can't hang forever on a stalled
 * request. Sits comfortably above the server's webhook timeout
 * (CONTACT_WEBHOOK_TIMEOUT_MS = 10s) so a slow-but-succeeding delivery isn't
 * aborted prematurely.
 */
export const CONTACT_REQUEST_TIMEOUT_MS = 15_000

const GENERIC_ERROR_MESSAGE =
  'Something went wrong sending your message. Please try again.'
const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your connection and try again."
const TIMEOUT_ERROR_MESSAGE =
  'The request timed out. Please try again or email me directly.'

// Friendlier, more specific client copy per server error code. Falls back to
// the server's own message, then to a generic line, so new codes still surface.
const ERROR_COPY: Record<ContactApiErrorCode, string> = {
  invalid_content_type: GENERIC_ERROR_MESSAGE,
  payload_too_large:
    'Your message is too long. Please shorten it and try again.',
  invalid_json: GENERIC_ERROR_MESSAGE,
  invalid_payload: 'Please double-check the form and try again.',
  missing_fields: 'Please complete all required fields.',
  invalid_email: 'Please enter a valid email address.',
  invalid_timestamp: 'Please refresh the page and try again.',
  rate_limited: 'Too many attempts. Please wait a few minutes, then try again.',
  service_unavailable: 'The form is temporarily unavailable right now.',
  webhook_failed:
    "Your message couldn't be delivered. Please try again in a moment.",
  internal_error: 'Something went wrong on our end. Please try again.',
}

function resolveErrorMessage(
  data: ContactApiResponse | null,
  httpStatus: number,
): string {
  if (data && data.success === false) {
    return ERROR_COPY[data.code] ?? data.error ?? GENERIC_ERROR_MESSAGE
  }
  if (httpStatus === 429) return ERROR_COPY.rate_limited
  if (httpStatus >= 500) return ERROR_COPY.internal_error
  return GENERIC_ERROR_MESSAGE
}

// fetch() rejects aborts with a DOMException, which is not reliably an
// `instanceof Error` across runtimes, so match on the name instead.
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  )
}

export type ContactSubmitResult = { ok: true } | { ok: false; message: string }

/**
 * POST the contact form, aborting after `timeoutMs`. Never throws: every
 * outcome (success, server error, timeout, network failure) resolves to a
 * discriminated result with display-ready copy, and the timeout is always
 * cleared. Server validation/abuse behavior is untouched.
 */
export async function submitContactRequest(
  form: ContactSubmission,
  options: {
    fetchImpl?: typeof fetch
    timeoutMs?: number
  } = {},
): Promise<ContactSubmitResult> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? CONTACT_REQUEST_TIMEOUT_MS

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      signal: controller.signal,
    })

    if (res.ok) {
      return { ok: true }
    }

    const data = (await res
      .json()
      .catch(() => null)) as ContactApiResponse | null
    return { ok: false, message: resolveErrorMessage(data, res.status) }
  } catch (error) {
    if (isAbortError(error)) {
      return { ok: false, message: TIMEOUT_ERROR_MESSAGE }
    }
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  } finally {
    clearTimeout(timeoutId)
  }
}
