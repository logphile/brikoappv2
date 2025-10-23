import { defineNuxtPlugin, useRoute, useHead, useRuntimeConfig } from '#imports'
import { computed } from 'vue'

// Adds a canonical link on every route. Uses a stable key to avoid duplicates.
export default defineNuxtPlugin(() => {
  const route = useRoute()
  const canonical = computed(() => {
    try {
      const base = (useRuntimeConfig().public as any)?.siteUrl || 'https://briko.app'
      // Normalize: no trailing slash except for root
      let path = String(route.path || '/')
      if (path !== '/' && path.endsWith('/')) path = path.replace(/\/+$/,'')
      return `${base}${path}`
    } catch {
      return `https://briko.app${route.path || '/'}`
    }
  })

  useHead({
    link: [
      { key: 'canonical', rel: 'canonical', href: canonical.value }
    ]
  })
})
