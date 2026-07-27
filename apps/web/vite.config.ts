import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const appDirectory = fileURLToPath(new URL('.', import.meta.url))
const workspaceRoot = path.resolve(appDirectory, '../..')

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      allow: [workspaceRoot],
    },
  },
  resolve: {
    alias: [
      {
        find: '@repo/ui/styles',
        replacement: path.resolve(workspaceRoot, 'src/index.css'),
      },
      {
        find: '@repo/ui',
        replacement: path.resolve(workspaceRoot, 'src/index.ts'),
      },
      {
        find: '@',
        replacement: path.resolve(appDirectory, 'src'),
      },
    ],
    dedupe: ['react', 'react-dom', 'motion'],
  },
  plugins: [tanstackStart(), nitro(), viteReact()],
})
