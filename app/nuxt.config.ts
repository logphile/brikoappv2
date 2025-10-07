import { defineNuxtConfig } from 'nuxt/config'
import rootConfig from '../nuxt.config'

// Reuse root config but run Nuxt with app/ as the project root.
// Force SPA for SWA static hosting and ensure Nitro static preset.
export default defineNuxtConfig({
  ...rootConfig,
  ssr: false,
  srcDir: '.',
  css: [
    ...(((rootConfig as any)?.css) || []),
    '@/assets/css/main.css'
  ],
  nitro: {
    ...(rootConfig as any)?.nitro,
    preset: 'static'
  },
  app: {
    ...(rootConfig as any)?.app,
    baseURL: '/',
    buildAssetsDir: '/_nuxt/',
  }
} as any)
