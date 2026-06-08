import { Redis } from '@upstash/redis'

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

const CONTACT_RATE_LIMIT_REDIS_KEY_PREFIX = 'contact-rate-limit'

/**
 * Forwarding headers trusted to carry the originating client IP, in priority
 * order: Cloudflare's `cf-connecting-ip`, then the left-most `x-forwarded-for`
 * entry, then `x-real-ip`.
 *
 * TRUST BOUNDARY: every one of these is client-spoofable at the network edge.
 * We only trust them because this app is meant to run behind a trusted
 * proxy/platform (e.g. Vercel) that overwrites them with the real peer address.
 * If deployed without that guarantee, an attacker can forge these headers to
 * evade or poison the contact rate limiter, so this resolution must be
 * revisited. See the README "Rate-limit identity and trusted proxy" note.
 */
const TRUSTED_CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'x-forwarded-for',
  'x-real-ip',
] as const

/**
 * Local fallback store used when a shared backend is unavailable.
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/** Hard cap to prevent unbounded growth from a flood of unique keys. */
const MAX_RATE_LIMIT_ENTRIES = 5_000

let upstashRedisClient: Redis | null | undefined
let hasWarnedAboutRateLimitFallback = false
let hasLoggedUpstashRateLimitFailure = false

function getFirstHeaderValue(headers: Headers, name: string): string | null {
  const value = headers.get(name)

  if (!value) {
    return null
  }

  // x-forwarded-for is a comma-separated, hop-by-hop appended list; the
  // left-most entry is the original client as recorded by the trusted proxy.
  const candidate = name === 'x-forwarded-for' ? value.split(',')[0] : value
  const trimmed = candidate?.trim()

  return trimmed ? trimmed : null
}

function cleanupExpiredRateLimitEntries(now: number) {
  for (const [ipAddress, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(ipAddress)
    }
  }

  if (rateLimitStore.size <= MAX_RATE_LIMIT_ENTRIES) {
    return
  }

  const overflow = rateLimitStore.size - MAX_RATE_LIMIT_ENTRIES
  const iterator = rateLimitStore.keys()
  for (let i = 0; i < overflow; i += 1) {
    const next = iterator.next()
    if (next.done) break
    rateLimitStore.delete(next.value)
  }
}

function getUpstashRedisClient(): Redis | null {
  if (upstashRedisClient !== undefined) {
    return upstashRedisClient
  }

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    upstashRedisClient = null
    return upstashRedisClient
  }

  upstashRedisClient = Redis.fromEnv({
    enableAutoPipelining: false,
    latencyLogging: false,
  })

  return upstashRedisClient
}

function buildRedisRateLimitKey(rateLimitKey: string) {
  return `${CONTACT_RATE_LIMIT_REDIS_KEY_PREFIX}:${rateLimitKey}`
}

function warnAboutInMemoryRateLimitFallback() {
  if (
    process.env.NODE_ENV !== 'production' ||
    hasWarnedAboutRateLimitFallback
  ) {
    return
  }

  hasWarnedAboutRateLimitFallback = true
  console.warn(
    'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured; falling back to the in-memory contact rate limiter.',
  )
}

function logUpstashRateLimitFailure(error: unknown) {
  if (hasLoggedUpstashRateLimitFailure) {
    return
  }

  hasLoggedUpstashRateLimitFailure = true
  console.error(
    'Contact rate limiting could not reach Upstash Redis; falling back to the in-memory limiter.',
    error,
  )
}

function recordRateLimitAttemptInMemory(
  rateLimitKey: string,
  now: number,
): RateLimitEntry {
  cleanupExpiredRateLimitEntries(now)

  const currentEntry = rateLimitStore.get(rateLimitKey)

  if (!currentEntry) {
    const entry = {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    }
    rateLimitStore.set(rateLimitKey, entry)
    return entry
  }

  currentEntry.count += 1
  return currentEntry
}

async function recordRateLimitAttemptWithUpstash(
  rateLimitKey: string,
  now: number,
): Promise<RateLimitEntry | null> {
  const redis = getUpstashRedisClient()
  if (!redis) {
    return null
  }

  const redisKey = buildRedisRateLimitKey(rateLimitKey)

  try {
    const tx = redis.multi()
    tx.incr(redisKey)
    tx.pttl(redisKey)

    const [countResult, ttlResult] = (await tx.exec()) as [number, number]
    const count = Number(countResult)
    let ttlMs = Number(ttlResult)

    if (!Number.isFinite(count)) {
      throw new Error(
        'Upstash rate limit counter returned a non-numeric value.',
      )
    }

    if (!Number.isFinite(ttlMs) || ttlMs < 0) {
      await redis.pexpire(redisKey, CONTACT_RATE_LIMIT_WINDOW_MS, 'NX')
      ttlMs = CONTACT_RATE_LIMIT_WINDOW_MS
    }

    return {
      count,
      resetAt: now + ttlMs,
    }
  } catch (error) {
    logUpstashRateLimitFailure(error)
    return null
  }
}

async function recordRateLimitAttempt(
  rateLimitKey: string,
  now: number,
): Promise<RateLimitEntry> {
  const remoteEntry = await recordRateLimitAttemptWithUpstash(rateLimitKey, now)

  if (remoteEntry) {
    return remoteEntry
  }

  warnAboutInMemoryRateLimitFallback()
  return recordRateLimitAttemptInMemory(rateLimitKey, now)
}

export function getClientIpAddress(headers: Headers): string | null {
  for (const headerName of TRUSTED_CLIENT_IP_HEADERS) {
    const value = getFirstHeaderValue(headers, headerName)
    if (value) {
      return value
    }
  }

  return null
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

export async function evaluateContactAbuse({
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
}): Promise<ContactAbuseCheckResult> {
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

  const currentEntry = await recordRateLimitAttempt(rateLimitKey, now)

  if (currentEntry.count > CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return {
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((currentEntry.resetAt - now) / 1_000),
      ),
      ipAddress,
    }
  }

  return {
    kind: 'allow',
    ipAddress,
  }
}

export function resetContactAbuseState() {
  rateLimitStore.clear()
  upstashRedisClient = undefined
  hasWarnedAboutRateLimitFallback = false
  hasLoggedUpstashRateLimitFailure = false
}
