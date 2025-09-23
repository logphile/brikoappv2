import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  typescript: { strict: true },
  routeRules: {
    '/community-studio': { redirect: '/gallery' },
    '/community-studio/**': { redirect: '/gallery' },
    // Robustness: if any link points to /sitemap, redirect to the static sitemap.xml
    '/sitemap': { redirect: '/sitemap.xml' },
    '/sitemap/': { redirect: '/sitemap.xml' }
  },
  css: [
    '@/assets/css/fonts.css',
    '@/assets/styles/globals.css',
    '@/assets/css/controls.css',
    '@/assets/css/buttons.css',
    '@/assets/css/forms.css',
    '@/assets/css/components.css'
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://briko.app',
      showSeeds: process.env.NUXT_PUBLIC_SHOW_SEEDS || ''
    }
  },
  nitro: {
    preset: 'static',
    publicAssets: [
      { dir: resolve(rootDir, 'public') }
    ],
    prerender: {
      crawlLinks: true,
      routes: ['/', '/mosaic', '/voxel', '/pricing', '/how-it-works', '/privacy', '/terms', '/login', '/studio', '/community-studio', '/studio/community', '/gallery']
    }
  },
  vite: {
    worker: { format: 'es' }
  },
  app: {
    head: {
      title: process.env.NUXT_PUBLIC_SITE_NAME || 'Briko',
      titleTemplate: `%s | ${process.env.NUXT_PUBLIC_SITE_NAME || 'Briko'}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#FFD808' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/briko-icon.svg?v=1' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/brand/favicon-32.png?v=2' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/brand/favicon-16.png?v=2' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/apple-touch-icon.png?v=2' },
        { rel: 'mask-icon', href: '/brand/safari-pinned-tab.svg?v=2', color: '#3AE59F' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        // Preload brand fonts to minimize FOUT
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Poppins-Medium.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/BespokeSlab-Bold.woff2', crossorigin: 'anonymous' }
      ]
    }
  }
})
