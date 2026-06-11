import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { gotoAndWaitForIntro } from './helpers/app'
import { collectConsoleErrors } from './helpers/console'

/**
 * Contact form behavior against an intercepted /api/contact. No request ever
 * reaches a real webhook: Playwright fulfills the API response directly, and
 * even if interception were bypassed, the local server has no
 * CONTACT_WEBHOOK_URL configured.
 */

async function fillContactForm(page: Page) {
  const contact = page.locator('#contact')
  await contact.scrollIntoViewIfNeeded()
  await expect(contact).toBeVisible()

  await page.locator('#contact-name').fill('Playwright Smoke')
  await page.locator('#contact-email').fill('smoke@example.com')
  await page.locator('#contact-project-type').selectOption('build')
  await page.locator('#contact-budget').selectOption('15k_30k')
  await page
    .locator('#contact-message')
    .fill('End-to-end test message. No webhook should receive this.')
}

test('shows fallback error copy and direct email guidance when the API is unavailable', async ({
  page,
}) => {
  // Fulfilling with a 5xx makes Chromium log a resource error for the API
  // call; that one is intentional.
  const consoleErrors = collectConsoleErrors(page, [/\/api\/contact/])

  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error:
          'Contact form is temporarily unavailable. Please email me directly.',
        code: 'service_unavailable',
      }),
    })
  })

  await gotoAndWaitForIntro(page, '/')
  await fillContactForm(page)

  await page.getByRole('button', { name: 'Send message' }).click()

  // Scoped to the form: Next.js mounts a global route-announcer alert, and
  // the CopyEmail widget has its own status region.
  const alert = page.locator('#contact form').getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText(
    'The form is temporarily unavailable right now.',
  )

  const emailLink = alert.getByRole('link', { name: 'Or email me directly' })
  await expect(emailLink).toBeVisible()
  await expect(emailLink).toHaveAttribute('href', /^mailto:/)

  // Inputs keep their values after an error so the visitor can retry.
  await expect(page.locator('#contact-name')).toHaveValue('Playwright Smoke')

  consoleErrors.assertClean()
})

test('shows the success state when the API accepts the submission', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page)

  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  await gotoAndWaitForIntro(page, '/')
  await fillContactForm(page)

  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('#contact form').getByRole('status')).toContainText(
    'Message received.',
  )

  consoleErrors.assertClean()
})
