import { defineNuxtRouteMiddleware } from 'nuxt/app'

// Disabled global auth guard: use named middleware instead (see app/middleware/auth.ts)
export default defineNuxtRouteMiddleware(() => {
  return
})
