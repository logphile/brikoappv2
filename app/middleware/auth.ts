import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

// Named auth middleware applied only on protected pages via definePageMeta({ middleware: ['auth'] })
export default defineNuxtRouteMiddleware((to) => {
  // Only run on client; protected pages are client-only (ssr: false)
  if (process.server) return

  // Nuxt Supabase composable (provided by @nuxtjs/supabase); rely on auto-import at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (globalThis as any).useSupabaseUser?.()
  if (!user) return

  // Do not guard the login route
  if (to.path === '/login') return

  // Explicit allowlist of protected routes
  const protectedRoutes = new Set<string>([
    '/studio',
    '/studio/community',
    '/gallery',
    '/avatar',
    '/mosaic',
    '/voxel',
    '/photo'
  ])

  if (protectedRoutes.has(to.path)) {
    if (!user.value) {
      return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }
  }
})
