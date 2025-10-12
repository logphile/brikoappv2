import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],

  modules: ['unplugin-icons/nuxt', '@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/supabase'],

  // Build-time SVG compiler for <i-collection-name-icon-name/> components
  // @ts-expect-error: Provided by unplugin-icons/nuxt module
  icons: {
    compiler: 'vue3',
    autoInstall: false
  },

  // Do NOT treat i-* tags as custom elements; they are Vue SFC components from unplugin-icons
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => {
        const webComponents = ['model-viewer', 'lottie-player']
        return webComponents.includes(tag)
      }
    }
  },

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
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/login',
      exclude: ['/', '/how-it-works', '/pricing', '/privacy', '/terms', '/legal', '/login']
    }
  }
  ,
  typescript: {
    tsConfig: {
      compilerOptions: {
        resolveJsonModule: true,
        esModuleInterop: true
      }
    }
  }
})
