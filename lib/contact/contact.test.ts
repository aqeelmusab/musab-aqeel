import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../../app/api/contact/route'
import { createEmptyContactSubmission } from './constants'
import { evaluateContactAbuse, resetContactAbuseState } from './abuse'
import { parseContactSubmission } from './validation'
import {
  buildContactWebhookPayload,
  resolveWebhookTarget,
  sendContactWebhook,
} from './webhook'
import type { ContactPayload } from './types'

const TEST_CONTACT: ContactPayload = {
  name: 'Musab Aqeel',
  email: 'hello@musabaqeel.com',
  budget: '$5k - $15k',
  projectType: 'Full Stack Build',
  message: 'Build a new product landing page.',
}

function createHeaders(ipAddress = '203.0.113.10') {
  return new Headers({
    'x-forwarded-for': ipAddress,
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('parseContactSubmission', () => {
  it('normalizes and validates a valid submission', () => {
    const submission = {
      ...createEmptyContactSubmission(2_000),
      name: '  Musab   Aqeel  ',
      email: '  HELLO@musabaqeel.com ',
      budget: '$5k - $15k',
      projectType: 'Full Stack Build',
      message: '  Need a production-ready build.  ',
    }

    const result = parseContactSubmission(submission)

    expect(result).toEqual({
      success: true,
      data: {
        payload: {
          name: 'Musab Aqeel',
          email: 'hello@musabaqeel.com',
          budget: '$5k - $15k',
          projectType: 'Full Stack Build',
          message: 'Need a production-ready build.',
        },
        metadata: {
          honeypotValue: '',
          startedAt: 2_000,
        },
      },
    })
  })

  it('rejects invalid option values', () => {
    const result = parseContactSubmission({
      ...createEmptyContactSubmission(2_000),
      ...TEST_CONTACT,
      budget: 'Totally custom budget',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      code: 'invalid_payload',
      error: 'Please choose a valid budget range.',
    })
  })
})

describe('evaluateContactAbuse', () => {
  beforeEach(() => {
    resetContactAbuseState()
  })

  it('silently rejects submissions that fill the honeypot', () => {
    const result = evaluateContactAbuse({
      headers: createHeaders(),
      honeypotValue: 'https://spam.example',
      startedAt: 1_000,
      now: 5_000,
    })

    expect(result).toEqual({
      kind: 'silently_reject',
      reason: 'honeypot',
      ipAddress: '203.0.113.10',
    })
  })

  it('rate limits repeated requests from the same IP', () => {
    const attemptResults = Array.from({ length: 6 }, () =>
      evaluateContactAbuse({
        headers: createHeaders(),
        honeypotValue: '',
        startedAt: 1_000,
        now: 5_000,
      }),
    )

    expect(attemptResults.at(-1)).toEqual({
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      ipAddress: '203.0.113.10',
    })
  })

  it('falls back to a submission identifier when the IP address is missing', () => {
    const emptyHeaders = new Headers()

    const attemptResults = Array.from({ length: 6 }, () =>
      evaluateContactAbuse({
        headers: emptyHeaders,
        honeypotValue: '',
        startedAt: 1_000,
        fallbackIdentifier: TEST_CONTACT.email,
        now: 5_000,
      }),
    )

    expect(attemptResults.at(-1)).toEqual({
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      ipAddress: null,
    })
  })
})

describe('webhook helpers', () => {
  it('detects supported webhook targets', () => {
    expect(
      resolveWebhookTarget('https://discord.com/api/webhooks/123/abc'),
    ).toBe('discord')
    expect(resolveWebhookTarget('https://hooks.slack.com/services/a/b/c')).toBe(
      'slack',
    )
    expect(resolveWebhookTarget('https://example.com/webhooks/contact')).toBe(
      'generic',
    )
  })

  it('builds a Discord webhook payload with the expected branding fields', () => {
    const payload = buildContactWebhookPayload({
      contact: TEST_CONTACT,
      webhookUrl: 'https://discord.com/api/webhooks/123/abc',
      now: new Date('2026-04-16T12:00:00.000Z'),
    })

    expect(payload).toMatchObject({
      username: 'musabaqeel.com',
      avatar_url: 'https://musabaqeel.com/favicons/favicon-96x96.png',
      embeds: [
        {
          description: '**Musab Aqeel** submitted a project inquiry.',
          timestamp: '2026-04-16T12:00:00.000Z',
        },
      ],
    })
  })

  it('returns a structured failure when webhook delivery fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchImpl = vi.fn(async () => {
      return new Response('Nope', { status: 500 })
    })

    const result = await sendContactWebhook({
      contact: TEST_CONTACT,
      webhookUrl: 'https://example.com/webhooks/contact',
      fetchImpl,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      success: false,
      status: 502,
      code: 'webhook_failed',
      error: 'Webhook delivery failed.',
    })

    consoleError.mockRestore()
  })
})

describe('contact route', () => {
  it('returns a service unavailable error in production when the webhook is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CONTACT_WEBHOOK_URL', '')

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10',
        },
        body: JSON.stringify({
          ...createEmptyContactSubmission(Date.now() - 5_000),
          ...TEST_CONTACT,
        }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error:
        'Contact form is temporarily unavailable. Please email me directly.',
      code: 'service_unavailable',
    })

    consoleError.mockRestore()
  })
})
