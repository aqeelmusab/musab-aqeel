import { expect, test } from '@playwright/test'

import { getProjectSlugs } from '../../src/lib/projects'
import { gotoAndWaitForIntro } from './helpers/app'
import { expectNoSeriousA11yViolations } from './helpers/axe'

/**
 * Accessibility regression checks. Pages are scanned after the intro overlay
 * clears; with reduced motion emulated (see playwright.config.ts) the reveal
 * system makes content visible immediately, so axe sees the real page rather
 * than opacity-0 placeholders mid-animation.
 */

const MOBILE_VIEWPORT = { width: 390, height: 844 }

test.describe('desktop', () => {
  test('the home page has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/')
    await expectNoSeriousA11yViolations(page)
  })

  test('the home page contact section has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/')

    const contact = page.locator('#contact')
    await contact.scrollIntoViewIfNeeded()
    await expect(contact).toBeVisible()

    await expectNoSeriousA11yViolations(page)
  })

  test('the work index has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/work')
    await expectNoSeriousA11yViolations(page)
  })

  for (const slug of getProjectSlugs()) {
    test(`/work/${slug} has no serious accessibility violations`, async ({
      page,
    }) => {
      await gotoAndWaitForIntro(page, `/work/${slug}`)
      await expectNoSeriousA11yViolations(page)
    })
  }
})

test.describe('mobile', () => {
  test.use({ viewport: MOBILE_VIEWPORT })

  test('the home page has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/')
    await expectNoSeriousA11yViolations(page)
  })

  test('the home page contact section has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/')

    const contact = page.locator('#contact')
    await contact.scrollIntoViewIfNeeded()
    await expect(contact).toBeVisible()

    await expectNoSeriousA11yViolations(page)
  })

  test('the work index has no serious accessibility violations', async ({
    page,
  }) => {
    await gotoAndWaitForIntro(page, '/work')
    await expectNoSeriousA11yViolations(page)
  })

  for (const slug of getProjectSlugs()) {
    test(`/work/${slug} has no serious accessibility violations`, async ({
      page,
    }) => {
      await gotoAndWaitForIntro(page, `/work/${slug}`)
      await expectNoSeriousA11yViolations(page)
    })
  }
})
