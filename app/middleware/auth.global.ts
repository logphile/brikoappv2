import { defineNuxtRouteMiddleware, useNuxtApp, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Only guard /projects/* routes
  if (!to.path.startsWith('/projects')) return
  // Do client-side check to rely on browser session
  if (import.meta.server) return
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) return navigateTo('/login')
  const { data } = await $supabase.auth.getUser()
  if (!data.user) return navigateTo('/login')
})
