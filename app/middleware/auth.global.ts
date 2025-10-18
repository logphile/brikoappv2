import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  // Only guard routes that explicitly opt-in
  if (!to.meta.requiresAuth) return

  // Don't redirect during SSR/static prerender; wait for client
  if (import.meta.server) return

  // Access auto-imported composable at runtime (avoid TS ambient declare here)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (globalThis as any).useSupabaseUser?.()
  if (!user) return

  // If user state hasn't hydrated yet, don't knee-jerk redirect.
  if (user.value === null) return

  if (!user.value) return navigateTo('/login')
})
