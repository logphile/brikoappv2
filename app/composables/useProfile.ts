import { useState } from 'nuxt/app'
// Use official Nuxt Supabase composable (only available on client)
declare const useSupabaseClient: <T = any>() => T

export type ProfileRow = {
  user_id: string
  handle?: string | null
  display_name?: string | null
}

export const useProfile = () => {
  // SSR-safe shared state
  const profile = useState<ProfileRow | null>('profile:data', () => null)
  const loading = useState<boolean>('profile:loading', () => false)
  const loaded  = useState<boolean>('profile:loaded',  () => false)

  async function getMyProfile(): Promise<ProfileRow | null> {
    if (!import.meta.client) return null
    const supabase = useSupabaseClient<any>()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, handle, display_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    return (data as ProfileRow) || null
  }

  async function refreshProfile(): Promise<void> {
    if (!import.meta.client || loaded.value || loading.value) return
    loading.value = true
    try {
      profile.value = await getMyProfile()
    } finally {
      loading.value = false
      loaded.value  = true
    }
  }

  async function updateMyProfile(payload: { handle?: string; display_name?: string }): Promise<void> {
    if (!import.meta.client) throw new Error('Supabase unavailable during SSR')
    const supabase = useSupabaseClient<any>()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('user_id', user.id)
    if (error) throw error
    // Best-effort refresh
    try { await refreshProfile() } catch {}
  }

  // Alias to match existing call sites / docs
  async function updateProfile(payload: { handle?: string; display_name?: string }): Promise<void> {
    return updateMyProfile(payload)
  }

  if (import.meta.client && !loaded.value && !loading.value) {
    void refreshProfile()
  }

  return { getMyProfile, updateMyProfile, updateProfile, profile, loading, loaded, refreshProfile }
}
