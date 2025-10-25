import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))
const ASSETS_VERSION = process.env.ASSETS_VERSION || 'v-local'

// Derive Supabase host for remote image allowlist (if provided)
const SUPABASE_HOST = (() => {
  try {
    const u = new URL(process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '')
    return u.hostname || ''
  } catch { return '' }
})()

export default defineNuxtConfig({
  // Production: SSR on; DevTools disabled
  ssr: true,
  srcDir: 'app',
  // Only auto-register from explicit folders to avoid duplicate names
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/gallery', pathPrefix: true }
  ],
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', 'unplugin-icons/nuxt', '@nuxt/image'],
  plugins: [
    '~/plugins/schema.org'
  ],
  typescript: { strict: true },
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'wasm-unsafe-eval'; font-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://sentry.io https://*.ingest.sentry.io;",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    // Static pages: prerender
    '/': { headers: { 'Cache-Control': 'no-store' }, prerender: true },
    '/how-it-works': { prerender: true },
    '/pricing': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/legal': { prerender: true },
    '/community-studio': { redirect: '/gallery' },
    '/community-studio/**': { redirect: '/gallery' },
    // Historic URL label ("Photo to Bricks") now routes to /mosaic
    '/photo-to-bricks': { redirect: '/mosaic' },
    // Robustness: if any link points to /sitemap, redirect to the static sitemap.xml
    '/sitemap': { redirect: '/sitemap.xml' },
    '/sitemap/': { redirect: '/sitemap.xml' },
    // Runtime pages should not be prerendered (client-only work: auth/stores/workers)
    '/login': { prerender: false, ssr: false },
    '/login/**': { prerender: false, ssr: false },
    '/gallery': { prerender: false },
    '/avatar': { prerender: false },
    '/studio': { prerender: false, ssr: false },
    '/studio/**': { prerender: false, ssr: false },
    '/photo': { prerender: false },
    '/mosaic': { prerender: false, ssr: false },
    '/voxel': { prerender: false, ssr: false },
    '/dev/**': { prerender: false, ssr: false },
    '/auth/**': { prerender: false, ssr: false },
    '/settings/**': { prerender: false, ssr: false },
    '/projects/new': { prerender: false, ssr: false },
    '/account/**': { prerender: false },
    '/projects/**': { prerender: false },
    '/project/**': { prerender: false },
    '/share/**': { prerender: false }
    ,
    // Admin pages should run client-side (middleware uses client auth state)
    '/admin': { prerender: false, ssr: false },
    '/admin/**': { prerender: false, ssr: false }
  },
  css: ['~/assets/css/fonts.css', '~/assets/css/tailwind.css', '~/assets/css/main.css', '~/assets/css/fixes.css', '~/assets/css/base.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      cloudflareAnalyticsToken: process.env.NUXT_PUBLIC_CF_ANALYTICS_TOKEN || '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Briko',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://briko.app',
      showSeeds: process.env.NUXT_PUBLIC_SHOW_SEEDS || '',
      features: {
        builder3d: false,
        remix: false,
        livePricing: false
      }
    }
  },
  image: {
    // Remote domains allowlist (Supabase public bucket host)
    domains: SUPABASE_HOST ? [SUPABASE_HOST] : [],
    // Preferred formats and quality
    format: ['webp', 'png', 'jpeg'],
    quality: 80,
    // Default responsive breakpoints for thumbs/grids
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
  },
  nitro: {
    preset: 'static',
    sourceMap: false,
    // Emit gzip/br assets alongside public output for SWA
    compressPublicAssets: true,
    publicAssets: [
      { dir: resolve(rootDir, 'public') }
    ],
    prerender: {
      // allow crawler but ignore runtime pages
      crawlLinks: true,
      failOnError: false,
      routes: ['/', '/how-it-works', '/pricing', '/privacy', '/terms', '/legal'],
      ignore: [
        '/login', '/login?next=/studio',
        '/gallery', '/avatar',
        '/studio', '/studio/community',
        '/mosaic', '/voxel'
      ]
    }
  },
  vite: {
    worker: { format: 'es' },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
      exclude: ['@techstark/opencv-js'],
      include: ['@iconify/vue']
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            // keep Three.js split; OpenCV should be client-only via plugin
            three: ['three'],
          }
        }
      },
      // keep default esbuild minifier; use esbuild.drop below
      minify: 'esbuild',
      // also provide terserOptions for flexibility if minifier is switched
      terserOptions: { compress: { drop_console: true, drop_debugger: true } }
      // If you prefer terser, also set minify: 'terser' and enable terserOptions
      // terserOptions: { compress: { drop_console: true, drop_debugger: true } }
    },
    // Drop console/debugger from prod bundles
    esbuild: { drop: ['console', 'debugger'] }
  },
  // Icons (unplugin-icons)
  icons: {
    autoInstall: true
  },
  // optional: reduce CSS inlining into HTML (uncomment if needed)
  // experimental: { inlineSSRStyles: false },
  app: {
    // Put every deploy’s assets under its own folder to avoid stale edge caches
    buildAssetsDir: `/_nuxt/${ASSETS_VERSION}/`,
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_SITE_NAME || 'Briko',
      titleTemplate: `%s | ${process.env.NUXT_PUBLIC_SITE_NAME || 'Briko'}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#FFD808' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/briko-icon.svg?v=1' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/brand/favicon-32.png?v=2' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/brand/favicon-16.png?v=2' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/apple-touch-icon.png?v=2' },
        { rel: 'mask-icon', href: '/brand/safari-pinned-tab.svg?v=2', color: '#3AE59F' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        // Preload brand fonts to minimize FOUT (match @font-face weights in use)
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/BespokeSlab-Bold.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Poppins-Regular.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Poppins-SemiBold.woff2', crossorigin: 'anonymous' }
      ]
    }
  }
})
