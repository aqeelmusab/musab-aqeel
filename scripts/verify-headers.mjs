#!/usr/bin/env node
/**
 * Verifies security headers and CSP on a running deployment.
 *
 * Usage:
 *   VERIFY_BASE_URL=http://localhost:3000 node scripts/verify-headers.mjs
 *   VERIFY_BASE_URL=https://musabaqeel.com node scripts/verify-headers.mjs
 *
 * Page routes must carry the global hardening headers (owned by
 * next.config.mjs) plus the Content-Security-Policy (owned by src/proxy.ts).
 * API and static routes are intentionally excluded by the proxy matcher, so
 * only the global headers are required there. HSTS and
 * upgrade-insecure-requests are only required on HTTPS targets.
 */

const baseUrl = (
  process.env.VERIFY_BASE_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')
const isHttps = baseUrl.startsWith('https:')

/** Directives src/proxy.ts must emit on every matched page route. */
const REQUIRED_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ['upgrade-insecure-requests'] : []),
]

const failures = []

function check(route, condition, message) {
  if (condition) return
  failures.push(`${route}: ${message}`)
}

function checkGlobalHeaders(route, headers) {
  const expectations = [
    ['x-content-type-options', (value) => value === 'nosniff', 'nosniff'],
    ['x-frame-options', (value) => value === 'deny', 'DENY'],
    [
      'referrer-policy',
      (value) => value === 'strict-origin-when-cross-origin',
      'strict-origin-when-cross-origin',
    ],
    [
      'permissions-policy',
      (value) =>
        ['camera=()', 'microphone=()', 'geolocation=()'].every((directive) =>
          value.includes(directive),
        ),
      'camera=(), microphone=(), geolocation=()',
    ],
    ...(isHttps
      ? [
          [
            'strict-transport-security',
            (value) =>
              value.includes('max-age=63072000') &&
              value.toLowerCase().includes('includesubdomains') &&
              value.includes('preload'),
            'max-age=63072000; includeSubDomains; preload',
          ],
        ]
      : []),
  ]

  for (const [name, isValid, expected] of expectations) {
    const value = headers.get(name)?.toLowerCase().trim()
    check(
      route,
      value !== undefined && isValid(value),
      `header "${name}" should match "${expected}", got ${value === undefined ? '<missing>' : `"${headers.get(name)}"`}`,
    )
  }
}

function checkCsp(route, headers) {
  const csp = headers.get('content-security-policy')

  if (!csp) {
    check(route, false, 'header "content-security-policy" is missing')
    return
  }

  for (const directive of REQUIRED_CSP_DIRECTIVES) {
    check(
      route,
      csp.includes(directive),
      `content-security-policy should include "${directive}", got "${csp}"`,
    )
  }
}

async function fetchRoute(route) {
  try {
    return await fetch(`${baseUrl}${route}`, {
      headers: { 'user-agent': 'verify-headers-script' },
      redirect: 'follow',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    check(route, false, `request failed: ${message}`)
    return null
  }
}

async function verifyPageRoute(route) {
  const response = await fetchRoute(route)
  if (!response) return

  check(route, response.status === 200, `expected 200, got ${response.status}`)
  checkGlobalHeaders(route, response.headers)
  checkCsp(route, response.headers)
}

/** Excluded from the proxy matcher: global headers only, no CSP required. */
async function verifyExcludedRoute(route) {
  const response = await fetchRoute(route)
  if (!response) return

  // The route must exist (GET on the POST-only contact API returns 405, not
  // 404); without this guard a deleted route with global headers would pass.
  check(
    route,
    response.status !== 404,
    `expected route to exist, got ${response.status}`,
  )
  checkGlobalHeaders(route, response.headers)
}

/** Picks one /work/[slug] route from the sitemap so the check stays in sync. */
async function discoverProjectRoute() {
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`)
    if (!response.ok) return null

    const xml = await response.text()
    const match = xml.match(/\/work\/([a-z0-9-]+)/)
    return match ? `/work/${match[1]}` : null
  } catch {
    return null
  }
}

const pageRoutes = ['/', '/work']

const projectRoute = await discoverProjectRoute()
if (projectRoute) {
  pageRoutes.push(projectRoute)
} else {
  console.warn(
    'warn: could not discover a /work/[slug] route from the sitemap; skipping the project page check',
  )
}

console.log(`Verifying headers against ${baseUrl} (HTTPS: ${isHttps})`)

for (const route of pageRoutes) {
  await verifyPageRoute(route)
}
await verifyExcludedRoute('/api/contact')

if (failures.length > 0) {
  console.error(`\nFAIL: ${failures.length} header check(s) failed:`)
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  process.exit(1)
}

console.log(
  `\nPASS: all header checks passed for ${pageRoutes.join(', ')} and /api/contact`,
)
