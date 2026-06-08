import { NextResponse, type NextRequest } from 'next/server'

/**
 * Static-compatible Content Security Policy.
 *
 * The home/work pages are statically generated on Vercel. A per-request nonce
 * cannot be added to Next.js' prerendered inline RSC/hydration scripts, so a
 * nonce-based script policy blocks hydration and leaves the intro overlay stuck.
 * Keep scripts same-origin and allow the inline bootstrap that static Next.js
 * pages require.
 *
 * Dev mode relaxes directives for HMR (ws:/wss:, `'unsafe-eval'`) and for
 * @vercel/analytics / @vercel/speed-insights debug scripts and beacons.
 */

// Standard hardening headers applied alongside the CSP on every matched route.
// Cross-Origin-Opener-Policy is intentionally omitted: it can interfere with
// @vercel/analytics / @vercel/speed-insights beacons and preview popups, and is
// not required for this static site.
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
}

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self'${isDev ? ' ws: wss: https://va.vercel-scripts.com https://vitals.vercel-insights.com' : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ]

  const csp = directives.join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', csp)

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicons|fonts|projects|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
