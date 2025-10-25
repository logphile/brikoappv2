import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

// Nuxt auto-imported composable from @nuxtjs/supabase (declared for TS only)
declare const useSupabaseUser: <T = any>() => { value: T | null }

export default defineNuxtRouteMiddleware((to: any) => {
  if (!to.path.startsWith('/admin')) return
  const user = useSupabaseUser<any>()
  if (!user?.value) return navigateTo('/')
  const allowed = ['phil@yourdomain.com']
  if (!allowed.includes(user.value.email || '')) return navigateTo('/')
})
