import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

// Nuxt auto-import composable from @nuxtjs/supabase
declare const useSupabaseClient: <T = any>() => T

export default defineNuxtRouteMiddleware(async (to) => {
  // Only guard admin routes
  if (!to.path.startsWith('/admin')) return

  // Client-only guard to avoid SSR false redirects
  if (import.meta.server) return

  const supabase = useSupabaseClient<any>()
  const { data: session } = await supabase.auth.getSession()
  const user = session?.session?.user
  if (!user) {
    return navigateTo('/')
  }

  // Fetch profile once and check role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.warn('profile fetch error', error)
    return navigateTo('/')
  }

  if (profile?.role !== 'admin') {
    return navigateTo('/')
  }
})
