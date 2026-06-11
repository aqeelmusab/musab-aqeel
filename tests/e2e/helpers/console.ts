import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface ConsoleErrorCollector {
  /** Assert that no unexpected console errors or page errors were captured. */
  assertClean(): void
}

/**
 * Console errors caused by the local environment rather than the app.
 * @vercel/analytics and @vercel/speed-insights inject scripts served from
 * /_vercel/* in production builds; outside Vercel (local `next start`, CI)
 * those requests 404 and Chromium logs a resource error.
 */
const ENVIRONMENT_ALLOWED_PATTERNS: readonly RegExp[] = [/\/_vercel\//]

/**
 * Starts collecting `console.error` output and uncaught page errors for a
 * page. Call `assertClean()` at the end of a test to fail it if anything
 * unexpected was captured.
 *
 * `allowedPatterns` exists for tests that intentionally provoke failures
 * (e.g. fulfilling /api/contact with a 5xx makes Chromium log a
 * "Failed to load resource" console error). Patterns are matched against the
 * message text and the source URL, since resource errors only carry the URL
 * in their location.
 */
export function collectConsoleErrors(
  page: Page,
  allowedPatterns: readonly RegExp[] = [],
): ConsoleErrorCollector {
  const errors: string[] = []
  const allAllowedPatterns = [
    ...ENVIRONMENT_ALLOWED_PATTERNS,
    ...allowedPatterns,
  ]

  page.on('console', (message) => {
    if (message.type() !== 'error') return

    const text = `${message.text()} (${message.location().url})`
    if (allAllowedPatterns.some((pattern) => pattern.test(text))) return

    errors.push(`console.error: ${text}`)
  })

  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`)
  })

  return {
    assertClean() {
      expect(errors, errors.join('\n')).toEqual([])
    },
  }
}
