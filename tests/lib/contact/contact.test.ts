import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/api/contact/route'
import {
  evaluateContactAbuse,
  resetContactAbuseState,
} from '@/lib/contact/abuse'
import { createEmptyContactSubmission } from '@/lib/contact/constants'
import type { ContactPayload } from '@/lib/contact/types'
import { parseContactSubmission } from '@/lib/contact/validation'
import {
  buildContactWebhookPayload,
  resolveWebhookTarget,
  sendContactWebhook,
} from '@/lib/contact/webhook'
import { APP_VERSION } from '@/lib/package-version'

// Form submissions carry the slug values; the API resolves them to labels.
const TEST_SUBMISSION = {
  name: 'Musab Aqeel',
  email: 'hello@musabaqeel.com',
  budget: 'under_3k',
  projectType: 'surgical',
  message: 'Build a new product landing page.',
}

// What the rest of the pipeline (webhook, etc.) sees post-validation.
const TEST_CONTACT: ContactPayload = {
  name: 'Musab Aqeel',
  email: 'hello@musabaqeel.com',
  budget: 'Under $3k (Scoped Fix)',
  projectType: 'Surgical Fix / Optimization',
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
      budget: 'under_3k',
      projectType: 'surgical',
      message: '  Need a production-ready build.  ',
    }

    const result = parseContactSubmission(submission)

    expect(result).toEqual({
      success: true,
      data: {
        payload: {
          name: 'Musab Aqeel',
          email: 'hello@musabaqeel.com',
          budget: 'Under $3k (Scoped Fix)',
          projectType: 'Surgical Fix / Optimization',
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
      ...TEST_SUBMISSION,
      budget: 'Totally custom budget',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      code: 'invalid_payload',
      error: 'Please choose a valid budget range.',
    })
  })

  it('rejects a budget value that does not belong to the chosen project type', () => {
    // 'under_3k' is valid under 'surgical' but not under 'build'.
    const result = parseContactSubmission({
      ...createEmptyContactSubmission(2_000),
      ...TEST_SUBMISSION,
      projectType: 'build',
      budget: 'under_3k',
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

  it('silently rejects submissions that fill the honeypot', async () => {
    const result = await evaluateContactAbuse({
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

  it('rate limits repeated requests from the same IP', async () => {
    const attemptResults = []

    for (let attempt = 0; attempt < 6; attempt += 1) {
      attemptResults.push(
        await evaluateContactAbuse({
          headers: createHeaders(),
          honeypotValue: '',
          startedAt: 1_000,
          now: 5_000,
        }),
      )
    }

    expect(attemptResults.at(-1)).toEqual({
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      retryAfterSeconds: 600,
      ipAddress: '203.0.113.10',
    })
  })

  it('falls back to a submission identifier when the IP address is missing', async () => {
    const emptyHeaders = new Headers()

    const attemptResults = []

    for (let attempt = 0; attempt < 6; attempt += 1) {
      attemptResults.push(
        await evaluateContactAbuse({
          headers: emptyHeaders,
          honeypotValue: '',
          startedAt: 1_000,
          fallbackIdentifier: TEST_CONTACT.email,
          now: 5_000,
        }),
      )
    }

    expect(attemptResults.at(-1)).toEqual({
      kind: 'reject',
      status: 429,
      code: 'rate_limited',
      error: 'Too many requests. Please wait a few minutes and try again.',
      retryAfterSeconds: 600,
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
      avatar_url: `https://musabaqeel.com/favicons/favicon-96x96.png?v=${APP_VERSION}`,
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
  beforeEach(() => {
    resetContactAbuseState()
  })

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
          ...TEST_SUBMISSION,
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

  it('returns Retry-After when the rate limit is exceeded', async () => {
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://example.com/webhooks/contact')

    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await POST(
        new Request('http://localhost/api/contact', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '203.0.113.10',
          },
          body: JSON.stringify({
            ...createEmptyContactSubmission(Date.now() - 5_000),
            ...TEST_SUBMISSION,
          }),
        }),
      )
    }

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10',
        },
        body: JSON.stringify({
          ...createEmptyContactSubmission(Date.now() - 5_000),
          ...TEST_SUBMISSION,
        }),
      }),
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('600')

    fetchImpl.mockRestore()
  })
})
