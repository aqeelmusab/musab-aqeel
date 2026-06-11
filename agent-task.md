# Agent Task Brief

You are working in `aqeelmusab/musab-aqeel`, a Next.js 16 / React 19 / TypeScript portfolio and contact-form app.

This file is intended as a single-session handoff for Fable 5. Keep the work scoped, incremental, and CI-friendly.

## Current baseline

- `pnpm run verify` already runs format check, lint, typecheck, tests, and build.
- Existing tests cover contact validation, abuse handling, webhook behavior, project data invariants, sitemap output, and `/work/[slug]` static params.
- Security headers are centralized in `next.config.mjs`.
- `src/proxy.ts` owns Content Security Policy only.
- The contact route already has stream-based request body size protection.
- Do not rewrite app architecture.
- Do not remove existing protections.
- Do not call real external webhooks from tests.

## Goal

Add the next production-quality QA layer:

1. Playwright smoke tests
2. axe/accessibility regression checks
3. Lighthouse/Core Web Vitals budget
4. deploy-time verification of headers/CSP
5. basic observability for contact failures

Implement this in one session if possible, preferably as one PR with separate logical commits.

Suggested commit split:

```txt
1. test: add Playwright smoke tests
2. test: add axe accessibility checks
3. ci: add Lighthouse quality budget
4. test: verify deployed headers and CSP
5. feat: add contact failure observability
```

---

## 1. Playwright smoke tests

Add Playwright-based smoke tests for the app.

### Install

```bash
pnpm add -D @playwright/test
```

### Package scripts

Add scripts to `package.json`:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui"
}
```

Keep existing scripts unchanged.

### Config

Create:

```txt
playwright.config.ts
```

Requirements:

- Use Playwright `webServer`.
- Prefer production-like mode: build first, then start.
- Use `reuseExistingServer` locally.
- Start with Chromium only to keep CI fast.
- Keep the test suite deterministic and not slow.

Suggested config shape:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? 'pnpm run build && pnpm run start'
      : 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

Adjust if the repo needs a different server command.

### Suggested files

```txt
tests/e2e/smoke.spec.ts
tests/e2e/contact.spec.ts
tests/e2e/helpers/console.ts
```

### Smoke coverage

Cover:

- `/` loads successfully.
- `/work` loads successfully.
- Every project route from `getProjectSlugs()` loads successfully.
- Main navigation links are visible/clickable.
- Footer social links exist.
- Contact section renders.
- Contact form fields are present.
- Contact form can show error feedback without hitting a real webhook.
- No unexpected `pageerror` or browser `console.error` on core pages.

### Contact test guidance

Do not deliver to a real webhook during E2E tests.

Use Playwright route interception for `/api/contact`, for example:

```ts
await page.route('**/api/contact', async (route) => {
  await route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      error: 'Contact form is temporarily unavailable. Please email me directly.',
      code: 'service_unavailable',
    }),
  })
})
```

Then assert that the UI shows useful fallback/error copy and direct email guidance.

### Acceptance criteria

- `pnpm run test:e2e` passes locally.
- Tests do not require external services.
- Tests do not hit real webhooks.
- Unexpected browser errors fail the test.

---

## 2. axe/accessibility regression checks

Add automated accessibility regression checks using axe with Playwright.

### Install

```bash
pnpm add -D @axe-core/playwright
```

### Package script

Add:

```json
{
  "test:a11y": "playwright test tests/e2e/a11y.spec.ts"
}
```

### Suggested files

```txt
tests/e2e/a11y.spec.ts
tests/e2e/helpers/axe.ts
```

### Coverage

Run axe on:

- `/`
- `/work`
- every `/work/[slug]` page
- the contact section or full home page after scrolling to contact
- desktop viewport
- mobile viewport if it does not make CI too slow

### Rules

- Fail on `serious` and `critical` axe violations.
- Include useful violation output in failures.
- Do not blanket-disable rules.
- If a rule must be disabled, document exactly why in the test file.

Suggested helper:

```ts
import { AxeBuilder } from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const violations = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(
    violations,
    JSON.stringify(
      violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => node.target),
      })),
      null,
      2,
    ),
  ).toEqual([])
}
```

### Acceptance criteria

- `pnpm run test:a11y` passes.
- Future serious/critical regressions fail CI.
- Any disabled rule is narrowly scoped and explained.

---

## 3. Lighthouse/Core Web Vitals budget

Add a lightweight Lighthouse CI budget.

### Install

```bash
pnpm add -D @lhci/cli
```

### Package scripts

Add:

```json
{
  "lhci:autorun": "lhci autorun",
  "test:perf": "pnpm run lhci:autorun"
}
```

### Config

Create:

```txt
.lighthouserc.cjs
```

Suggested initial config:

```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run start',
      startServerReadyPattern: 'Ready|started server|Local:',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/work',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### Important guidance

- This app uses heavy motion and visual effects, so do not create fake-perfect budgets.
- Prefer budgets that catch regressions over budgets that produce flaky CI.
- Adjust thresholds after the first real run if needed.
- Run Lighthouse against a production build.
- Store Lighthouse output as CI artifacts if easy.

### Acceptance criteria

- `pnpm run build && pnpm run lhci:autorun` works locally.
- CI reports Lighthouse budget failures clearly.
- Thresholds are realistic and not flaky.

---

## 4. Deploy-time verification of headers/CSP

Add automated verification for security headers and CSP.

### Package script

Add:

```json
{
  "verify:headers": "node scripts/verify-headers.mjs"
}
```

### File

Create:

```txt
scripts/verify-headers.mjs
```

### Behavior

The script should:

- Accept `VERIFY_BASE_URL` from env.
- Default to `http://localhost:3000`.
- Fetch:
  - `/`
  - `/work`
  - one `/work/[slug]` route if practical
  - `/api/contact` only for non-CSP global header checks if useful
- Assert expected headers.
- Print clear failure messages naming the route and header.
- Exit non-zero on failure.

### Expected global headers

Require these on routes where `next.config.mjs` headers apply:

```txt
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: contains camera=(), microphone=(), geolocation=()
```

For HTTPS/deployed checks, also require:

```txt
strict-transport-security: max-age=63072000; includeSubDomains; preload
```

Do not require HSTS on local HTTP.

### Expected CSP on matched page routes

For page routes matched by `src/proxy.ts`, require `content-security-policy` to exist and include:

```txt
default-src 'self'
script-src 'self' 'unsafe-inline'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

In production HTTPS checks, also expect:

```txt
upgrade-insecure-requests
```

### Important guidance

- Header names are case-insensitive.
- The proxy matcher intentionally excludes some static/API paths.
- Do not require CSP on excluded paths unless the app is changed to support it.
- Keep the script dependency-free if possible. Node 24 has native `fetch`.

### Acceptance criteria

Local built app:

```bash
pnpm run build
pnpm run start
VERIFY_BASE_URL=http://localhost:3000 pnpm run verify:headers
```

Production deploy:

```bash
VERIFY_BASE_URL=https://musabaqeel.com pnpm run verify:headers
```

Both should produce clear pass/fail output.

---

## 5. Basic observability for contact failures

Add basic, privacy-conscious observability for contact form failures.

Do not add a heavy external service unless it is completely optional and isolated behind env vars. Structured console logs are enough for this pass.

### Suggested file

```txt
src/lib/contact/observability.ts
tests/lib/contact/observability.test.ts
```

### Minimum implementation

Create a helper such as:

```ts
export function logContactEvent(event: ContactObservabilityEvent): void
```

or:

```ts
export function logContactFailure(event: ContactFailureEvent): void
```

Use structured logs via `console.warn` / `console.error`.

Include useful non-sensitive fields:

- event name
- error code
- HTTP status if applicable
- webhook target type, not webhook URL
- whether Upstash is configured
- failure reason category:
  - missing webhook config
  - webhook non-2xx response
  - webhook timeout/network failure
  - rate limited
  - internal route error
  - Upstash unavailable/fallback
- timestamp

Do not log:

- full contact message
- webhook URL
- raw email address
- full IP address
- contact name
- secrets/tokens

### Optional correlation

If correlation is useful, add optional hashing:

```txt
CONTACT_OBSERVABILITY_SALT=
```

If `CONTACT_OBSERVABILITY_SALT` is present, hash email/IP with SHA-256 and the salt.

If no salt is set, avoid identifiers entirely.

Update `.env.example` if this env var is added.

### Integration points

Integrate observability into:

- missing production webhook config
- webhook delivery failure
- `/api/contact` catch-all internal error path
- Upstash fallback/failure
- rate-limited submissions, but avoid noisy spam

Keep existing API behavior and response bodies unchanged.

### Tests

Add tests that verify:

- webhook URL is never logged
- raw email is never logged
- raw IP is never logged
- message body is never logged
- event shape includes useful non-sensitive fields
- hashing is deterministic when salt is configured
- no identifiers are emitted when salt is absent

Use `vi.spyOn(console, 'warn')` and `vi.spyOn(console, 'error')`.

### Acceptance criteria

- Contact failures emit useful structured logs.
- Logs do not leak PII/secrets.
- Existing contact route behavior remains unchanged.
- Existing tests continue passing.

---

## CI integration

Update `.github/workflows/ci.yml`.

Current CI runs:

- install
- `pnpm run verify`

Keep that fast correctness gate.

Add separate browser/quality jobs or steps for:

- Playwright install
- E2E smoke tests
- accessibility tests
- Lighthouse CI
- header verification

Preferred structure:

```txt
1. verify
   - checkout
   - setup pnpm
   - setup Node 24
   - install frozen lockfile
   - pnpm run verify

2. browser-tests
   - checkout
   - setup pnpm
   - setup Node 24
   - install frozen lockfile
   - install Playwright browsers
   - pnpm run test:e2e
   - pnpm run test:a11y

3. quality-budget
   - checkout
   - setup pnpm
   - setup Node 24
   - install frozen lockfile
   - pnpm run build
   - pnpm run lhci:autorun
   - start built app and run pnpm run verify:headers
```

Use Chromium only initially to keep CI time reasonable.

Add artifacts if easy:

- Playwright HTML report
- Lighthouse report

Do not make local `pnpm run verify` painfully slow unless explicitly desired. Browser and Lighthouse checks may remain separate scripts/jobs.

---

## Package script target

After implementation, `package.json` should roughly include:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui",
  "test:a11y": "playwright test tests/e2e/a11y.spec.ts",
  "lhci:autorun": "lhci autorun",
  "test:perf": "pnpm run lhci:autorun",
  "verify:headers": "node scripts/verify-headers.mjs"
}
```

Do not remove existing scripts.

---

## Final acceptance checklist

Before opening a PR or handing back:

```bash
pnpm install
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e
pnpm run test:a11y
pnpm run lhci:autorun
VERIFY_BASE_URL=http://localhost:3000 pnpm run verify:headers
```

Confirm:

- No real webhook is called during tests.
- No PII/secrets are logged by observability.
- Browser tests are deterministic and not flaky.
- Lighthouse thresholds are realistic.
- CSP/header verification distinguishes page routes from intentionally excluded routes.
- CI remains understandable and not excessively slow.
- Existing behavior remains unchanged unless directly required for this task.

## Definition of done

This task is complete when:

- Playwright smoke tests exist and pass.
- axe accessibility checks exist and pass.
- Lighthouse CI budget exists and can run locally/CI.
- Header/CSP verification script exists and passes against local production server.
- Contact failure observability exists, is tested, and redacts sensitive data.
- CI runs the new checks in a maintainable way.
- `pnpm run verify` still passes.
