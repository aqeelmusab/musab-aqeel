import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/api/contact/route'
import {
  evaluateContactAbuse,
  getClientIpAddress,
  resetContactAbuseState,
} from '@/lib/contact/abuse'
import {
  CONTACT_MAX_REQUEST_BODY_BYTES,
  createEmptyContactSubmission,
} from '@/lib/contact/constants'
import type { ContactPayload } from '@/lib/contact/types'
import { parseContactSubmission } from '@/lib/contact/validation'
import {
  buildContactWebhookPayload,
  resolveWebhookTarget,
  sendContactWebhook,
} from '@/lib/contact/webhook'
import { APP_VERSION } from '@/lib/package-version'

// Slugs are the canonical contact-payload shape end-to-end; webhook builders
// resolve them to display labels at render time.
const TEST_CONTACT: ContactPayload = {
  name: 'Musab Aqeel',
  email: 'hello@musabaqeel.com',
  budget: 'under_3k',
  projectType: 'surgical',
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
          budget: 'under_3k',
          projectType: 'surgical',
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

  it('rejects a budget value that does not belong to the chosen project type', () => {
    // 'under_3k' is valid under 'surgical' but not under 'build'.
    const result = parseContactSubmission({
      ...createEmptyContactSubmission(2_000),
      ...TEST_CONTACT,
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

describe('getClientIpAddress', () => {
  it('prefers cf-connecting-ip over other forwarding headers', () => {
    const headers = new Headers({
      'cf-connecting-ip': '198.51.100.5',
      'x-forwarded-for': '203.0.113.10, 70.41.3.18',
      'x-real-ip': '192.0.2.7',
    })

    expect(getClientIpAddress(headers)).toBe('198.51.100.5')
  })

  it('uses the left-most x-forwarded-for entry when cf-connecting-ip is absent', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.10, 70.41.3.18, 150.172.238.178',
      'x-real-ip': '192.0.2.7',
    })

    expect(getClientIpAddress(headers)).toBe('203.0.113.10')
  })

  it('falls back to x-real-ip when no other forwarding header is set', () => {
    const headers = new Headers({ 'x-real-ip': '192.0.2.7' })

    expect(getClientIpAddress(headers)).toBe('192.0.2.7')
  })

  it('returns null when no trusted forwarding header carries an IP', () => {
    expect(getClientIpAddress(new Headers())).toBeNull()
    expect(
      getClientIpAddress(new Headers({ 'x-forwarded-for': '   ' })),
    ).toBeNull()
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

  it('silently rejects submissions sent faster than the minimum time', async () => {
    const result = await evaluateContactAbuse({
      headers: createHeaders(),
      honeypotValue: '',
      startedAt: 4_900,
      now: 5_000,
    })

    expect(result).toEqual({
      kind: 'silently_reject',
      reason: 'submitted_too_fast',
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

  it('rejects substring host spoofing when resolving webhook targets', () => {
    expect(
      resolveWebhookTarget('https://evil.com/hooks.slack.com/services/a/b/c'),
    ).toBe('generic')
    expect(
      resolveWebhookTarget('https://evil.com/discord.com/api/webhooks/123/abc'),
    ).toBe('generic')
    expect(resolveWebhookTarget('not-a-url')).toBe('generic')
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
      allowed_mentions: { parse: [] },
      embeds: [
        {
          description:
            '**Musab Aqeel** submitted a project inquiry.\n\n>>> Build a new product landing page.',
          timestamp: '2026-04-16T12:00:00.000Z',
        },
      ],
    })
  })

  it('keeps a long message inside the Discord description limit', () => {
    const longMessage = 'a'.repeat(6_000)
    const payload = buildContactWebhookPayload({
      contact: { ...TEST_CONTACT, message: longMessage },
      webhookUrl: 'https://discord.com/api/webhooks/123/abc',
      now: new Date('2026-04-16T12:00:00.000Z'),
    }) as {
      embeds: Array<{
        description: string
        fields: Array<{ name: string }>
      }>
    }

    const [embed] = payload.embeds
    expect(embed).toBeDefined()
    expect(embed?.description.length).toBeLessThanOrEqual(4_096)
    // The message must not be relegated to a 1024-char field.
    expect(embed?.fields.some((f) => f.name.includes('Message'))).toBe(false)
  })

  it('escapes Discord markdown so values cannot break out of code spans', () => {
    const payload = buildContactWebhookPayload({
      contact: { ...TEST_CONTACT, name: 'a`b`c' },
      webhookUrl: 'https://discord.com/api/webhooks/123/abc',
      now: new Date('2026-04-16T12:00:00.000Z'),
    }) as { embeds: Array<{ fields: Array<{ name: string; value: string }> }> }

    const nameField = payload.embeds[0]?.fields.find((f) =>
      f.name.includes('Name'),
    )
    expect(nameField?.value).toBe("`a'b'c`")
  })

  it('splits a long Slack message across multiple sections', () => {
    const longMessage = 'b'.repeat(7_000)
    const payload = buildContactWebhookPayload({
      contact: { ...TEST_CONTACT, message: longMessage },
      webhookUrl: 'https://hooks.slack.com/services/a/b/c',
      now: new Date('2026-04-16T12:00:00.000Z'),
    }) as {
      blocks: Array<{ type: string; text?: { type: string; text: string } }>
    }

    const messageSections = payload.blocks.filter(
      (block) =>
        block.type === 'section' &&
        typeof block.text?.text === 'string' &&
        block.text.text.startsWith('b'),
    )
    expect(messageSections.length).toBeGreaterThan(1)
    for (const section of messageSections) {
      expect(section.text?.text.length).toBeLessThanOrEqual(3_000)
    }
  })

  it('renders slug-shaped contact fields as human-readable labels', () => {
    const payload = buildContactWebhookPayload({
      contact: TEST_CONTACT,
      webhookUrl: 'https://discord.com/api/webhooks/123/abc',
      now: new Date('2026-04-16T12:00:00.000Z'),
    }) as { embeds: Array<{ fields: Array<{ name: string; value: string }> }> }

    const fields = payload.embeds[0]?.fields ?? []
    const budgetField = fields.find((f) => f.name.includes('Budget'))
    const projectTypeField = fields.find((f) => f.name.includes('Project Type'))

    expect(budgetField?.value).toBe('`Under $3k (Scoped Fix)`')
    expect(projectTypeField?.value).toBe('`Surgical Fix / Optimization`')
  })

  it('includes both slugs and resolved labels in the generic webhook payload', () => {
    const payload = buildContactWebhookPayload({
      contact: TEST_CONTACT,
      webhookUrl: 'https://example.com/webhooks/contact',
      now: new Date('2026-04-16T12:00:00.000Z'),
    })

    expect(payload).toMatchObject({
      budget: 'under_3k',
      projectType: 'surgical',
      display: {
        budget: 'Under $3k (Scoped Fix)',
        projectType: 'Surgical Fix / Optimization',
      },
      source: 'contact-form',
      timestamp: '2026-04-16T12:00:00.000Z',
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
            ...TEST_CONTACT,
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
          ...TEST_CONTACT,
        }),
      }),
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('600')

    fetchImpl.mockRestore()
  })

  it('rejects an oversized content-length with 413 before delivering the webhook', async () => {
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://example.com/webhooks/contact')

    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(CONTACT_MAX_REQUEST_BODY_BYTES + 1),
          'x-forwarded-for': '203.0.113.10',
        },
        body: JSON.stringify({
          ...createEmptyContactSubmission(Date.now() - 5_000),
          ...TEST_CONTACT,
        }),
      }),
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Request body is too large.',
      code: 'payload_too_large',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockRestore()
  })

  it('rejects an oversized request body even when content-length is missing', async () => {
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://example.com/webhooks/contact')

    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

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
          message: 'a'.repeat(CONTACT_MAX_REQUEST_BODY_BYTES),
        }),
      }),
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Request body is too large.',
      code: 'payload_too_large',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockRestore()
  })

  it('accepts a normal-sized request whose content-length is within the limit', async () => {
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://example.com/webhooks/contact')

    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    const body = JSON.stringify({
      ...createEmptyContactSubmission(Date.now() - 5_000),
      ...TEST_CONTACT,
    })

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(Buffer.byteLength(body)),
          'x-forwarded-for': '203.0.113.10',
        },
        body,
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    fetchImpl.mockRestore()
  })

  it('returns 415 for a non-JSON content type even when content-length is huge', async () => {
    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
          'content-length': String(CONTACT_MAX_REQUEST_BODY_BYTES + 1),
          'x-forwarded-for': '203.0.113.10',
        },
        body: 'not json',
      }),
    )

    expect(response.status).toBe(415)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Contact form expects application/json.',
      code: 'invalid_content_type',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockRestore()
  })

  it('returns 400 for invalid JSON when the body is within the size limit', async () => {
    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10',
        },
        body: '{ not valid json',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid JSON body.',
      code: 'invalid_json',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockRestore()
  })

  it('returns 400 invalid_json for an empty request body', async () => {
    const fetchImpl = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10',
        },
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid JSON body.',
      code: 'invalid_json',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    fetchImpl.mockRestore()
  })
})
