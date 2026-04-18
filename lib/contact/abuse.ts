import {
  CONTACT_MIN_SUBMISSION_TIME_MS,
  CONTACT_RATE_LIMIT_MAX_REQUESTS,
  CONTACT_RATE_LIMIT_WINDOW_MS,
} from './constants'
import type { ContactAbuseCheckResult } from './types'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getFirstHeaderValue(headers: Headers, name: string): string | null {
  const value = headers.get(name)

  if (!value) {
    return null
  }

  return name === 'x-forwarded-for' ? value.split(',')[0]?.trim() ?? null : value.trim()
}

function cleanupExpiredRateLimitEntries(now: number) {
  for (const [ipAddress, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(ipAddress)
    }
  }
}

export function getClientIpAddress(headers: Headers): string | null {
  const ipAddress =
    getFirstHeaderValue(headers, 'cf-connecting-ip') ??
    getFirstHeaderValue(headers, 'x-forwarded-for') ??
    getFirstHeaderValue(headers, 'x-real-ip')

  return ipAddress || null
}

function resolveRateLimitKey({
  ipAddress,
  fallbackIdentifier,
}: {
  ipAddress: string | null
  fallbackIdentifier?: string
}) {
  if (ipAddress) {
    return `ip:${ipAddress}`
  }

  const normalizedFallback = fallbackIdentifier?.trim().toLowerCase()
  if (normalizedFallback) {
    return `fallback:${normalizedFallback}`
  }

  return null
}

export function evaluateContactAbuse({
  headers,
  honeypotValue,
  startedAt,
  fallbackIdentifier,
  now = Date.now(),
}: {
  headers: Headers
  honeypotValue: string
  startedAt: number
  fallbackIdentifier?: string
  now?: number
}): ContactAbuseCheckResult {
  const ipAddress = getClientIpAddress(headers)

  if (honeypotValue) {
    return {
      kind: 'silently_reject',
      reason: 'honeypot',
      ipAddress,
    }
  }

  if (startedAt > now || now - startedAt < CONTACT_MIN_SUBMISSION_TIME_MS) {
    return {
      kind: 'silently_reject',
      reason: 'submitted_too_fast',
      ipAddress,
    }
  }

  const rateLimitKey = resolveRateLimitKey({
    ipAddress,
    fallbackIdentifier,
  })

  if (!rateLimitKey) {
    return {
      kind: 'allow',
      ipAddress: null,
    }
  }

  cleanupExpiredRateLimitEntries(now)

  const currentEntry = rateLimitStore.get(rateLimitKey)

  if (!currentEntry) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    })

    return {
      kind: 'allow',
      ipAddress,
    }
  }

  if (currentEntry.count >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return {
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      ipAddress,
    }
  }

  currentEntry.count += 1

  return {
    kind: 'allow',
    ipAddress,
  }
}

export function resetContactAbuseState() {
  rateLimitStore.clear()
}
