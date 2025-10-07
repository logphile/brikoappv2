import { defineNuxtConfig } from 'nuxt/config'
import rootConfig from '../nuxt.config'

// Reuse root config but run Nuxt with app/ as the project root.
// Force SPA for SWA static hosting and ensure Nitro static preset.
export default defineNuxtConfig({
  ...rootConfig,
  ssr: false,
  srcDir: '.',
  modules: [
    ...(((rootConfig as any)?.modules) || []),
    '@nuxtjs/supabase'
  ],
  css: [
    ...(((rootConfig as any)?.css) || []),
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    ...((rootConfig as any)?.runtimeConfig || {}),
    public: {
      ...(((rootConfig as any)?.runtimeConfig?.public) || {}),
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      // keep both keys for compatibility with custom plugins and the module
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  },
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
