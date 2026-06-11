import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendContactWebhook } from '@/lib/contact'
import {
  logContactFailure,
  resetContactObservabilityState,
} from '@/lib/contact/observability'

type ConsoleSpy = MockInstance<typeof console.error>

const SENSITIVE_EMAIL = 'visitor@example.com'
const SENSITIVE_IP = '203.0.113.10'
const SENSITIVE_WEBHOOK_URL =
  'https://discord.com/api/webhooks/123456/secret-token'
const SENSITIVE_MESSAGE = 'Top secret project brief, do not log this.'
const SENSITIVE_NAME = 'Jane Visitor'

function capturedOutput(spy: ConsoleSpy): string {
  return spy.mock.calls.map((call) => call.join(' ')).join('\n')
}

function parseLastLogLine(spy: ConsoleSpy): {
  [key: string]: unknown
} {
  const lastCall = spy.mock.calls.at(-1)
  expect(lastCall).toBeDefined()
  return JSON.parse(String(lastCall?.[0]))
}

describe('logContactFailure', () => {
  let consoleError: ConsoleSpy
  let consoleWarn: ConsoleSpy

  beforeEach(() => {
    resetContactObservabilityState()
    vi.unstubAllEnvs()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
    consoleWarn.mockRestore()
    vi.unstubAllEnvs()
  })

  it('emits a structured event with useful non-sensitive fields', () => {
    logContactFailure({
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      httpStatus: 500,
      webhookTarget: 'discord',
      email: SENSITIVE_EMAIL,
    })

    const record = parseLastLogLine(consoleError)

    expect(record).toMatchObject({
      event: 'contact_failure',
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      httpStatus: 500,
      webhookTarget: 'discord',
      upstashConfigured: false,
    })
    expect(typeof record.timestamp).toBe('string')
  })

  it('never logs raw email or IP', () => {
    vi.stubEnv('CONTACT_OBSERVABILITY_SALT', 'test-salt')

    logContactFailure({
      reason: 'rate_limited',
      code: 'rate_limited',
      httpStatus: 429,
      email: SENSITIVE_EMAIL,
      ipAddress: SENSITIVE_IP,
    })

    const output = capturedOutput(consoleWarn) + capturedOutput(consoleError)
    expect(output).not.toContain(SENSITIVE_EMAIL)
    expect(output).not.toContain(SENSITIVE_IP)
  })

  it('omits identifiers entirely when no salt is configured', () => {
    logContactFailure({
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      httpStatus: 500,
      email: SENSITIVE_EMAIL,
      ipAddress: SENSITIVE_IP,
    })

    const record = parseLastLogLine(consoleError)
    expect(record).not.toHaveProperty('emailHash')
    expect(record).not.toHaveProperty('ipHash')
    expect(record).not.toHaveProperty('email')
    expect(record).not.toHaveProperty('ipAddress')
  })

  it('hashes identifiers deterministically when a salt is configured', () => {
    vi.stubEnv('CONTACT_OBSERVABILITY_SALT', 'test-salt')

    logContactFailure({
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      email: SENSITIVE_EMAIL,
      ipAddress: SENSITIVE_IP,
    })
    logContactFailure({
      reason: 'internal_error',
      code: 'internal_error',
      email: SENSITIVE_EMAIL,
      ipAddress: SENSITIVE_IP,
    })

    const calls = consoleError.mock.calls
    expect(calls).toHaveLength(2)
    const [firstCall, secondCall] = calls
    const first = JSON.parse(String(firstCall?.[0]))
    const second = JSON.parse(String(secondCall?.[0]))

    expect(first.emailHash).toMatch(/^[0-9a-f]{16}$/)
    expect(first.ipHash).toMatch(/^[0-9a-f]{16}$/)
    expect(second.emailHash).toBe(first.emailHash)
    expect(second.ipHash).toBe(first.ipHash)
    expect(first.emailHash).not.toBe(first.ipHash)
  })

  it('produces different hashes for different salts', () => {
    vi.stubEnv('CONTACT_OBSERVABILITY_SALT', 'salt-one')
    logContactFailure({
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      email: SENSITIVE_EMAIL,
    })

    vi.stubEnv('CONTACT_OBSERVABILITY_SALT', 'salt-two')
    logContactFailure({
      reason: 'webhook_non_2xx',
      code: 'webhook_failed',
      email: SENSITIVE_EMAIL,
    })

    const calls = consoleError.mock.calls
    const [firstCall, secondCall] = calls
    const first = JSON.parse(String(firstCall?.[0]))
    const second = JSON.parse(String(secondCall?.[0]))
    expect(first.emailHash).not.toBe(second.emailHash)
  })

  it('reports upstashConfigured when Upstash env vars are present', () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')

    logContactFailure({
      reason: 'internal_error',
      code: 'internal_error',
    })

    const record = parseLastLogLine(consoleError)
    expect(record.upstashConfigured).toBe(true)
  })

  it('logs expected operational states via console.warn', () => {
    logContactFailure({ reason: 'upstash_unavailable' })
    logContactFailure({ reason: 'rate_limited', code: 'rate_limited' })

    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).toHaveBeenCalledTimes(2)
  })

  it('throttles rate_limited events to avoid noisy spam', () => {
    logContactFailure({ reason: 'rate_limited', code: 'rate_limited' })
    logContactFailure({ reason: 'rate_limited', code: 'rate_limited' })
    logContactFailure({ reason: 'rate_limited', code: 'rate_limited' })

    expect(consoleWarn).toHaveBeenCalledTimes(1)
  })
})

describe('contact failure observability integration', () => {
  let consoleError: ConsoleSpy
  let consoleWarn: ConsoleSpy

  beforeEach(() => {
    resetContactObservabilityState()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
    consoleWarn.mockRestore()
    vi.unstubAllEnvs()
  })

  it('logs a webhook non-2xx failure without leaking the URL or payload', async () => {
    const fetchImpl = vi.fn(async () => new Response('Nope', { status: 500 }))

    await sendContactWebhook({
      contact: {
        name: SENSITIVE_NAME,
        email: SENSITIVE_EMAIL,
        budget: 'under_3k',
        projectType: 'surgical',
        message: SENSITIVE_MESSAGE,
      },
      webhookUrl: SENSITIVE_WEBHOOK_URL,
      fetchImpl,
    })

    const output = capturedOutput(consoleError) + capturedOutput(consoleWarn)
    expect(output).toContain('"event":"contact_failure"')
    expect(output).toContain('"reason":"webhook_non_2xx"')
    expect(output).toContain('"webhookTarget":"discord"')
    expect(output).toContain('"httpStatus":500')
    expect(output).not.toContain(SENSITIVE_WEBHOOK_URL)
    expect(output).not.toContain('secret-token')
    expect(output).not.toContain(SENSITIVE_EMAIL)
    expect(output).not.toContain(SENSITIVE_MESSAGE)
    expect(output).not.toContain(SENSITIVE_NAME)
  })

  it('logs a webhook network failure with the error name', async () => {
    const fetchImpl = vi.fn(async () => {
      throw Object.assign(new Error('timed out'), { name: 'TimeoutError' })
    })

    await sendContactWebhook({
      contact: {
        name: SENSITIVE_NAME,
        email: SENSITIVE_EMAIL,
        budget: 'under_3k',
        projectType: 'surgical',
        message: SENSITIVE_MESSAGE,
      },
      webhookUrl: SENSITIVE_WEBHOOK_URL,
      fetchImpl,
    })

    const output = capturedOutput(consoleError)
    expect(output).toContain('"reason":"webhook_request_failed"')
    expect(output).toContain('"errorName":"TimeoutError"')
    expect(output).not.toContain(SENSITIVE_WEBHOOK_URL)
    expect(output).not.toContain(SENSITIVE_MESSAGE)
  })
})
