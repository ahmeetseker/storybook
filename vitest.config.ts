import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@repo/ui/styles',
        replacement: `${workspaceRoot}src/index.css`,
      },
      {
        find: '@repo/ui',
        replacement: `${workspaceRoot}src/index.ts`,
      },
      {
        find: '@',
        replacement: `${workspaceRoot}apps/web/src`,
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'apps/web/src/**/*.test.{ts,tsx}',
    ],
  },
})
