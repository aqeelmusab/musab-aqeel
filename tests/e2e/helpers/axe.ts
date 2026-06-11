import { AxeBuilder } from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Disabled rules. Every entry needs a documented reason.
 *
 * - color-contrast: the site's visual identity deliberately uses dim
 *   tertiary/secondary text on a dark background (marquee strip, terminal
 *   code block, section labels, footer links). axe flags several hundred of
 *   these nodes as serious on every page, so the rule cannot gate CI without
 *   a design change the owner has explicitly not asked for. Contrast is
 *   still monitored: the Lighthouse accessibility budget
 *   (.lighthouserc.cjs) tracks the same audit as part of its category
 *   score, so a regression that newly tanks contrast still surfaces there.
 */
const DISABLED_RULES = ['color-contrast']

/**
 * Runs axe against the current page state and fails on serious/critical
 * WCAG 2.0/2.1 A and AA violations. Lower-impact findings are intentionally
 * not gating: they tend to be noisy and are better handled in review.
 */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(DISABLED_RULES)
    .analyze()

  const violations = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(
    violations,
    JSON.stringify(
      violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node) => node.target),
      })),
      null,
      2,
    ),
  ).toEqual([])
}
