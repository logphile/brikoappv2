import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

// Named auth middleware; attach via definePageMeta({ middleware: ['auth'], requiresAuth: true })
export default defineNuxtRouteMiddleware((to) => {
  // Client only; never redirect during SSR/static generation
  if (import.meta.server) return

  // Nuxt Supabase composable (auto-imported at runtime)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (globalThis as any).useSupabaseUser?.()
  if (!user) return

  // If still hydrating, do nothing — avoids false negatives on refresh
  if (user.value === null) return

  // If route is protected and user not signed in, send to /login
  if (to.meta.requiresAuth && !user.value) {
    return navigateTo('/login')
  }
})
