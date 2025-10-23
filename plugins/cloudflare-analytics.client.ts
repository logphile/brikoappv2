import { defineNuxtPlugin } from '#imports'

// Cloudflare Web Analytics is injected during SSR/SSG via useHead in app/app.vue.
// This client plugin is intentionally a no-op to avoid duplicate beacons.
export default defineNuxtPlugin(() => {
  // no-op
})
