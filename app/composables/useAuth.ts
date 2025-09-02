import { useNuxtApp, useState } from 'nuxt/app'

export type AuthUser = { id: string; email?: string }

export const useAuth = () => {
  const { $supabase } = useNuxtApp() as any
  const user = useState<AuthUser | null>('user', () => null)
  const loading = useState<boolean>('authLoading', () => true)

  const refreshUser = async () => {
    if (!$supabase) {
      user.value = null
      loading.value = false
      return
    }
    const { data } = await $supabase.auth.getUser()
    user.value = data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null
    loading.value = false
  }

  const loginWithMagicLink = async (email: string) => {
    if (!$supabase) throw new Error('Auth unavailable')
    await $supabase.auth.signInWithOtp({ email })
  }

  const logout = async () => {
    if (!$supabase) return
    await $supabase.auth.signOut()
    user.value = null
  }

  if (process.client) {
    // initialize once
    if (loading.value) refreshUser()
    if ($supabase) {
      $supabase.auth.onAuthStateChange((_evt: any, session: any) => {
        user.value = session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null
      })
    }
  }

  return { user, loading, loginWithMagicLink, logout, refreshUser }
}
