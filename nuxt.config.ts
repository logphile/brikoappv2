import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  typescript: { strict: true },
  css: ['@/assets/styles/globals.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    }
  },
  nitro: { prerender: { crawlLinks: true, routes: ['/', '/mosaic', '/voxel', '/avatar', '/login', '/health'] } },
  vite: {
    worker: { format: 'es' }
  },
  app: {
    head: {
      title: 'BrickMOC Companion',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})
