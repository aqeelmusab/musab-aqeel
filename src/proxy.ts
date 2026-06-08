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
 *
 * Production needs no extra script-src/connect-src for that telemetry: on
 * Vercel both packages load their scripts and send beacons from first-party
 * same-origin paths (`/_vercel/insights/*`, `/_vercel/speed-insights/*`), which
 * `'self'` already covers. The external `va.vercel-scripts.com` /
 * `vitals.vercel-insights.com` hosts are only used by the dev debug builds.
 */

// Non-CSP hardening headers (X-Content-Type-Options, Referrer-Policy,
// Permissions-Policy, X-Frame-Options, etc.) are owned by next.config.mjs so
// they apply on every route without duplication. Cross-Origin-Opener-Policy is
// intentionally omitted there: it can interfere with @vercel/analytics /
// @vercel/speed-insights beacons and preview popups. This proxy is responsible
// only for the Content-Security-Policy on matched pages.
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
