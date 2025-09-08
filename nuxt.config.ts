import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  typescript: { strict: true },
  css: [
    '@/assets/styles/globals.css',
    '@/assets/css/controls.css',
    '@/assets/css/buttons.css',
    '@/assets/css/forms.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      cloudflareAnalyticsToken: process.env.NUXT_PUBLIC_CF_ANALYTICS_TOKEN || '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Briko',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://briko.app'
    }
  },
  nitro: {
    preset: 'static',
    publicAssets: [
      { dir: resolve(rootDir, 'public') }
    ],
    prerender: {
      crawlLinks: true,
      routes: ['/', '/mosaic', '/voxel', '/pricing', '/how-it-works', '/privacy', '/terms', '/login', '/studio', '/community-studio']
    }
  },
  vite: {
    worker: { format: 'es' }
  },
  app: {
    head: {
      title: process.env.NUXT_PUBLIC_SITE_NAME || 'Briko',
      titleTemplate: `%s | ${process.env.NUXT_PUBLIC_SITE_NAME || 'Briko'}`,
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/briko-favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/briko-icon-apple-180.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  }
})
