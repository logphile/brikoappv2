import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware((_to: any) => {
  // No-op: admin gating handled in middleware/auth.global.ts
  return
})
