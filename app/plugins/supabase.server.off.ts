import { defineNuxtPlugin } from '#imports'

// Static build: avoid creating a server-side Supabase client and any @supabase/ssr usage.
// The @nuxtjs/supabase module + client-only code paths will handle auth on the browser.
export default defineNuxtPlugin(() => {
  return {}
})
