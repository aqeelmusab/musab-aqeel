import { defineConfig, devices } from '@playwright/test'

/**
 * E2E tests run against a production build (`next build && next start`) so
 * they exercise the same output that ships. In CI the build happens as an
 * explicit workflow step, so the web server only needs `next start`. Locally
 * an already-running server on :3000 (dev or prod) is reused; otherwise a
 * production server is built and started.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // The reveal system honors prefers-reduced-motion: content becomes
    // visible without scroll-scrubbed GSAP timelines, which keeps tests
    // deterministic instead of depending on animation timing.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? 'pnpm run start'
      : 'pnpm run build && pnpm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
})
