import { createHash } from 'node:crypto'

import type { ContactApiErrorCode, ContactWebhookTarget } from './types'

/**
 * Privacy-conscious structured logging for contact form failures.
 *
 * Events are emitted as a single JSON line via console.error/console.warn so
 * any log drain (Vercel, etc.) can filter on `event: 'contact_failure'`.
 * Nothing sensitive is ever included: no message body, no webhook URL, no
 * raw email or IP. When CONTACT_OBSERVABILITY_SALT is configured, email/IP
 * are included as salted SHA-256 hashes for correlation; without a salt they
 * are omitted entirely.
 */

export type ContactFailureReason =
  | 'missing_webhook_config'
  | 'webhook_non_2xx'
  | 'webhook_request_failed'
  | 'rate_limited'
  | 'upstash_unavailable'
  | 'internal_error'

export interface ContactFailureEvent {
  reason: ContactFailureReason
  /** API error code returned to the client, when one exists. */
  code?: ContactApiErrorCode
  /** HTTP status involved (response status or upstream webhook status). */
  httpStatus?: number
  /** Webhook provider type. Never the webhook URL. */
  webhookTarget?: ContactWebhookTarget
  /** Error class name for network/timeout failures (e.g. TimeoutError). */
  errorName?: string
  /** Raw email; hashed with the salt or dropped, never logged as-is. */
  email?: string
  /** Raw client IP; hashed with the salt or dropped, never logged as-is. */
  ipAddress?: string | null
}

const CONTACT_FAILURE_EVENT_NAME = 'contact_failure'

/** Rate-limited submissions can arrive in bursts; cap the log frequency. */
const RATE_LIMITED_LOG_INTERVAL_MS = 60_000

let lastRateLimitedLogAt: number | null = null

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

function hashIdentifier(value: string, salt: string): string {
  return createHash('sha256')
    .update(`${salt}:${value}`)
    .digest('hex')
    .slice(0, 16)
}

function buildLogRecord(event: ContactFailureEvent): Record<string, unknown> {
  const salt = process.env.CONTACT_OBSERVABILITY_SALT?.trim()

  const record: Record<string, unknown> = {
    event: CONTACT_FAILURE_EVENT_NAME,
    reason: event.reason,
    upstashConfigured: isUpstashConfigured(),
    timestamp: new Date().toISOString(),
  }

  if (event.code !== undefined) record.code = event.code
  if (event.httpStatus !== undefined) record.httpStatus = event.httpStatus
  if (event.webhookTarget !== undefined) {
    record.webhookTarget = event.webhookTarget
  }
  if (event.errorName !== undefined) record.errorName = event.errorName

  if (salt) {
    if (event.email) record.emailHash = hashIdentifier(event.email, salt)
    if (event.ipAddress) record.ipHash = hashIdentifier(event.ipAddress, salt)
  }

  return record
}

export function logContactFailure(event: ContactFailureEvent): void {
  if (event.reason === 'rate_limited') {
    const now = Date.now()
    if (
      lastRateLimitedLogAt !== null &&
      now - lastRateLimitedLogAt < RATE_LIMITED_LOG_INTERVAL_MS
    ) {
      return
    }
    lastRateLimitedLogAt = now
  }

  const record = buildLogRecord(event)
  const line = JSON.stringify(record)

  // Rate limiting and Upstash fallback are expected operational states;
  // everything else means a visitor's message was lost.
  if (
    event.reason === 'rate_limited' ||
    event.reason === 'upstash_unavailable'
  ) {
    console.warn(line)
    return
  }

  console.error(line)
}

export function resetContactObservabilityState(): void {
  lastRateLimitedLogAt = null
}
