import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { proxy } from '@/proxy'

function createRequest(path = '/') {
  return new NextRequest(new Request(`http://localhost${path}`))
}

function getCsp(path = '/') {
  return proxy(createRequest(path)).headers.get('Content-Security-Policy') ?? ''
}

function getDirective(csp: string, name: string) {
  return csp
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive === name || directive.startsWith(`${name} `))
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('proxy security headers', () => {
  // Non-CSP hardening headers (X-Content-Type-Options, Referrer-Policy,
  // Permissions-Policy, X-Frame-Options) are owned by next.config.mjs and are
  // applied by the framework, so they are not set on the proxy() response here.
  it('does not set non-CSP hardening headers (owned by next.config.mjs)', () => {
    const response = proxy(createRequest('/'))

    expect(response.headers.get('X-Content-Type-Options')).toBeNull()
    expect(response.headers.get('Referrer-Policy')).toBeNull()
    expect(response.headers.get('Permissions-Policy')).toBeNull()
    expect(response.headers.get('X-Frame-Options')).toBeNull()
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

// On Vercel, @vercel/analytics and @vercel/speed-insights serve their scripts
// and beacons from first-party `/_vercel/*` paths, so production telemetry
// needs nothing beyond `'self'`. The external Vercel hosts are dev-only.
describe('proxy CSP and Vercel telemetry', () => {
  it('serves production telemetry from same-origin without external Vercel hosts', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const csp = getCsp()

    expect(getDirective(csp, 'script-src')).toBe(
      `script-src 'self' 'unsafe-inline'`,
    )
    expect(getDirective(csp, 'connect-src')).toBe(`connect-src 'self'`)

    expect(csp).not.toContain('va.vercel-scripts.com')
    expect(csp).not.toContain('vitals.vercel-insights.com')
  })

  it('does not introduce wildcard sources in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const csp = getCsp()

    expect(csp).not.toContain('*')
    // A bare `https:` scheme source would broadly open the policy.
    expect(csp).not.toMatch(/(?:^|\s)https:(?:\s|;|$)/)
  })

  it('allows the Vercel debug script and beacon hosts in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const csp = getCsp()

    const scriptSrc = getDirective(csp, 'script-src') ?? ''
    const connectSrc = getDirective(csp, 'connect-src') ?? ''

    expect(scriptSrc).toContain('https://va.vercel-scripts.com')
    expect(connectSrc).toContain('https://va.vercel-scripts.com')
    expect(connectSrc).toContain('https://vitals.vercel-insights.com')
    // HMR transports remain dev-only.
    expect(connectSrc).toContain('ws:')
    expect(connectSrc).toContain('wss:')
  })
})
