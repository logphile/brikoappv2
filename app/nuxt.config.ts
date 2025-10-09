import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/supabase'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  runtimeConfig: {
    // Server-only (only needed if you ever use a service role on server routes)
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
    },
    public: {
      // New nested shape preferred by @nuxtjs/supabase
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
      },
      // Back-compat keys (if referenced elsewhere in code)
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    }
  },

  // Only generate truly static routes; do not crawl links
  nitro: {
    publicAssets: [
      { dir: resolve(dirname(fileURLToPath(import.meta.url)), '../public') }
    ],
    prerender: {
      crawlLinks: false,
      routes: ['/', '/how-it-works', '/pricing', '/privacy', '/terms', '/legal']
    }
  },

  // Dynamic/runtime pages must not be prerendered
  routeRules: {
    '/login': { prerender: false },
    '/login/**': { prerender: false },
    '/studio': { prerender: false },
    '/studio/**': { prerender: false },
    '/gallery': { prerender: false },
    '/avatar': { prerender: false },
    '/mosaic': { prerender: false },
    '/voxel': { prerender: false },
    '/photo': { prerender: false }
  }
  ,
  // Avoid surprise redirects during build previews
  // @ts-expect-error: Module option provided by @nuxtjs/supabase
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/login',
      exclude: ['/', '/how-it-works', '/pricing', '/privacy', '/terms', '/legal', '/login']
    }
  }
})
