import { defineNuxtPlugin } from 'nuxt/app'

// No-op: rely entirely on @nuxtjs/supabase composables (useSupabaseClient/useSupabaseUser)
export default defineNuxtPlugin(() => {
  return {}
})
