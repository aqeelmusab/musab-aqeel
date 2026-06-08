import { afterEach, describe, expect, it, vi } from 'vitest'

import { createEmptyContactSubmission } from '@/lib/contact/constants'
import { submitContactRequest } from '@/lib/contact/submit'
import type { ContactSubmission } from '@/lib/contact/types'

const FORM: ContactSubmission = {
  ...createEmptyContactSubmission(1_000),
  name: 'Musab Aqeel',
  email: 'hello@musabaqeel.com',
  budget: 'under_3k',
  projectType: 'surgical',
  message: 'Build a new product landing page.',
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('submitContactRequest', () => {
  it('resolves ok on a successful response and clears the timeout', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }))

    return submitContactRequest(FORM, { fetchImpl }).then((result) => {
      expect(result).toEqual({ ok: true })
      expect(fetchImpl).toHaveBeenCalledTimes(1)
      expect(clearSpy).toHaveBeenCalled()
      // No pending timer should remain to fire later.
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  it('passes an abort signal to fetch', async () => {
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      expect(init?.signal).toBeInstanceOf(AbortSignal)
      return new Response(null, { status: 204 })
    })

    await submitContactRequest(FORM, { fetchImpl })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('aborts the request and returns the timeout message after the deadline', async () => {
    vi.useFakeTimers()

    const fetchImpl = vi.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        }),
    )

    const pending = submitContactRequest(FORM, { fetchImpl, timeoutMs: 100 })
    await vi.advanceTimersByTimeAsync(100)
    const result = await pending

    expect(result).toEqual({
      ok: false,
      message: 'The request timed out. Please try again or email me directly.',
    })
    expect(fetchImpl.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
  })

  it('maps a server error response to friendly copy', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        { success: false, error: 'Rate limited.', code: 'rate_limited' },
        429,
      ),
    )

    const result = await submitContactRequest(FORM, { fetchImpl })

    expect(result).toEqual({
      ok: false,
      message: 'Too many attempts. Please wait a few minutes, then try again.',
    })
  })

  it('falls back to a status-based message when the error body is unparseable', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('upstream boom', { status: 500 }),
    )

    const result = await submitContactRequest(FORM, { fetchImpl })

    expect(result).toEqual({
      ok: false,
      message: 'Something went wrong on our end. Please try again.',
    })
  })

  it('returns a network message when the request rejects for a non-abort reason', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })

    const result = await submitContactRequest(FORM, { fetchImpl })

    expect(result).toEqual({
      ok: false,
      message:
        "Couldn't reach the server. Check your connection and try again.",
    })
  })
})
