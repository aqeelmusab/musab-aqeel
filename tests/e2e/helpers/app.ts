import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * The cosmetic intro overlay plays for ~3s on every full page load, then
 * lifts off over ~1.4s before `visibility: hidden` is set. Interactions and
 * accessibility scans must wait for it to clear or they hit a full-screen
 * z-9999 overlay.
 */
export async function waitForIntroToClear(page: Page) {
  await expect(page.locator('.intro')).toBeHidden({ timeout: 15_000 })
}

/** Navigate to a path and wait until the intro overlay has cleared. */
export async function gotoAndWaitForIntro(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response, `expected a navigation response for ${path}`).not.toBeNull()
  expect(response?.status()).toBe(200)
  await waitForIntroToClear(page)
  return response
}
