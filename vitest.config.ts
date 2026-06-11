import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const srcRoot = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': srcRoot,
    },
  },
  test: {
    environment: 'node',
    // Unit/integration tests only. Playwright owns tests/e2e (*.spec.ts),
    // which Vitest's default include pattern would otherwise pick up.
    include: ['tests/**/*.test.ts'],
  },
})
