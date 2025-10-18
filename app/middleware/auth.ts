import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

// Nuxt auto-import composable (declare for TS safety)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseUser: <T = any>() => T

// Named auth middleware; attach via definePageMeta({ middleware: ['auth'], requiresAuth: true })
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const user = useSupabaseUser<any>()

  if (to.meta.requiresAuth && user.value === null) return // wait for hydration
  if (to.meta.requiresAuth && !user.value) return navigateTo('/login')
})
