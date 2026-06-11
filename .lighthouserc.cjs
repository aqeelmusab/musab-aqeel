/**
 * Lighthouse CI budget. Run against a production build:
 *
 *   pnpm run build && pnpm run lhci:autorun
 *
 * Thresholds are regression tripwires, not aspirational targets: this site
 * ships heavy motion (GSAP, Lenis, custom cursor), so performance metrics are
 * warnings while category floors for accessibility/best-practices/SEO are
 * hard errors. Adjust after real runs if a threshold proves flaky.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run start',
      startServerReadyPattern: 'Ready|started server|Local:',
      url: ['http://localhost:3000/', 'http://localhost:3000/work'],
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
      target: 'filesystem',
      outputDir: '.lighthouseci/reports',
    },
  },
}
