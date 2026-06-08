import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { proxy } from '@/proxy'

function createRequest(path = '/') {
  return new NextRequest(new Request(`http://localhost${path}`))
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('proxy security headers', () => {
  it('applies the standard hardening headers on matched routes', () => {
    const response = proxy(createRequest('/'))

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    )
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('keeps the Content Security Policy intact', () => {
    const response = proxy(createRequest('/'))
    const csp = response.headers.get('Content-Security-Policy')

    expect(csp).toContain(`default-src 'self'`)
    expect(csp).toContain(`object-src 'none'`)
    expect(csp).toContain(`frame-ancestors 'none'`)
  })

  it('omits dev-only CSP allowances in production', () => {
    vi.stubEnv('NODE_ENV', 'production')

    const response = proxy(createRequest('/'))
    const csp = response.headers.get('Content-Security-Policy')

    expect(csp).not.toContain('unsafe-eval')
    expect(csp).not.toContain('va.vercel-scripts.com')
    expect(csp).not.toContain('ws:')
    expect(csp).toContain('upgrade-insecure-requests')
  })

  it('includes dev-only CSP allowances in development', () => {
    vi.stubEnv('NODE_ENV', 'development')

    const response = proxy(createRequest('/'))
    const csp = response.headers.get('Content-Security-Policy')

    expect(csp).toContain('unsafe-eval')
    expect(csp).toContain('va.vercel-scripts.com')
    expect(csp).not.toContain('upgrade-insecure-requests')
  })
})
