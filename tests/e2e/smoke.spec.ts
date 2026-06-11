import { expect, test } from '@playwright/test'

import { SOCIAL_LINKS } from '../../src/lib/config'
import { getProjectSlugs } from '../../src/lib/projects'
import { gotoAndWaitForIntro } from './helpers/app'
import { collectConsoleErrors } from './helpers/console'

test.describe('home page', () => {
  test('loads without errors and renders the hero', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)

    await gotoAndWaitForIntro(page, '/')

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#main-content')).toBeVisible()

    consoleErrors.assertClean()
  })

  test('shows the main navigation links', async ({ page }) => {
    await gotoAndWaitForIntro(page, '/')

    // Desktop nav items are buttons (they drive Lenis scroll-navigation,
    // not URL changes) and only render at the lg breakpoint.
    const header = page.locator('header')
    for (const label of ['About', 'Work', 'Process', 'Contact']) {
      const navButton = header.getByRole('button', {
        name: label,
        exact: true,
      })
      await expect(navButton).toBeVisible()
      await expect(navButton).toBeEnabled()
    }
  })

  test('shows the footer social links', async ({ page }) => {
    await gotoAndWaitForIntro(page, '/')

    const footer = page.locator('footer')
    for (const { label, href } of SOCIAL_LINKS) {
      const link = footer.getByRole('link', { name: label, exact: true })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', href)
    }
  })

  test('renders the contact section with all form fields', async ({ page }) => {
    await gotoAndWaitForIntro(page, '/')

    const contact = page.locator('#contact')
    await contact.scrollIntoViewIfNeeded()
    await expect(contact).toBeVisible()

    await expect(page.locator('#contact-name')).toBeVisible()
    await expect(page.locator('#contact-email')).toBeVisible()
    await expect(page.locator('#contact-project-type')).toBeVisible()
    await expect(page.locator('#contact-budget')).toBeVisible()
    await expect(page.locator('#contact-message')).toBeVisible()
    await expect(
      contact.getByRole('button', { name: 'Send message' }),
    ).toBeVisible()
  })
})

test.describe('work pages', () => {
  test('the work index loads without errors', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)

    await gotoAndWaitForIntro(page, '/work')

    await expect(page.locator('h1')).toBeVisible()

    consoleErrors.assertClean()
  })

  for (const slug of getProjectSlugs()) {
    test(`the project page /work/${slug} loads without errors`, async ({
      page,
    }) => {
      const consoleErrors = collectConsoleErrors(page)

      await gotoAndWaitForIntro(page, `/work/${slug}`)

      await expect(page.locator('h1')).toBeVisible()

      consoleErrors.assertClean()
    })
  }
})
