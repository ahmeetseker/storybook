import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const appDirectory = fileURLToPath(new URL('.', import.meta.url))
const workspaceRoot = path.resolve(appDirectory, '../..')

/**
 * Statik dağıtımlarda (GitHub Pages) uygulama alt yolda servis edilir.
 * `WEB_BASE_PATH` verilmezse kök yoldan çalışan normal davranış korunur.
 */
const basePath = process.env.WEB_BASE_PATH ?? '/'

/** Statik dağıtım modunda tüm route'lar build sırasında HTML'e dökülür. */
const staticBuild = process.env.WEB_STATIC === '1'

export default defineConfig({
  base: basePath,
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
  plugins: [
    tanstackStart({
      // Statik dağıtımda her route için HTML üretilir. Crawler'ın bulduğu
      // ama HTML dosyası gerektirmeyen adresler burada elenir:
      // `/health` sunucu handler'ı ve query varyantları HTML gerektirmez.
      prerender: {
        enabled: staticBuild,
        crawlLinks: true,
        failOnError: false,
        filter: ({ path: pagePath }) =>
          !pagePath.includes('?') && !pagePath.endsWith('/health'),
      },
      // Prerender edilmemiş adresler için router state'i taşımayan kabuk;
      // GitHub Pages bunu 404 yanıtı olarak servis eder ve routing client'ta sürer.
      spa: {
        enabled: staticBuild,
        prerender: { outputPath: '/404.html' },
      },
    }),
    nitro(),
    viteReact(),
  ],
})
