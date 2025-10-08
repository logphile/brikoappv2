import { useState } from 'nuxt/app'
// Nuxt auto-imported composable from @nuxtjs/supabase (only exists on client)
declare const useSupabaseClient: <T = any>() => T

export type AuthUser = { id: string; email?: string }

export const useAuth = () => {
  // SSR-safe shared state
  const user = useState<AuthUser | null>('user', () => null)
  const loading = useState<boolean>('authLoading', () => true)

  const refreshUser = async () => {
    if (!import.meta.client) {
      // On server, do nothing; client will populate
      user.value = null
      loading.value = false
      return
    }
    const supabase = useSupabaseClient<any>()
    const { data } = await supabase.auth.getUser()
    user.value = data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null
    loading.value = false
  }

  const loginWithMagicLink = async (email: string, redirectTo?: string) => {
    if (!import.meta.client) throw new Error('Auth unavailable during SSR')
    const supabase = useSupabaseClient<any>()
    const redirect = redirectTo || `${window.location.origin}/login`
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect }
    })
  }

  const logout = async () => {
    if (!import.meta.client) return
    const supabase = useSupabaseClient<any>()
    await supabase.auth.signOut()
    user.value = null
  }

  if (import.meta.client) {
    // initialize once on client
    if (loading.value) {
      refreshUser().catch(() => { loading.value = false })
    }
    const supabase = useSupabaseClient<any>()
    supabase.auth.onAuthStateChange((_evt: any, session: any) => {
      user.value = session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null
    })
  }

  return { user, loading, loginWithMagicLink, logout, refreshUser }
}
