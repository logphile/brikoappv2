import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  // Only generate truly static routes; do not crawl links
  nitro: {
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
})
