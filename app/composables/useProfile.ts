import { useNuxtApp } from 'nuxt/app'

export type ProfileRow = {
  user_id: string
  handle?: string | null
  display_name?: string | null
}

export const useProfile = () => {
  const { $supabase } = useNuxtApp() as any

  async function getMyProfile(): Promise<ProfileRow | null> {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await $supabase
      .from('profiles')
      .select('user_id, handle, display_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    return (data as ProfileRow) || null
  }

  async function updateMyProfile(payload: { handle?: string; display_name?: string }): Promise<void> {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await $supabase
      .from('profiles')
      .update(payload)
      .eq('user_id', user.id)
    if (error) throw error
  }

  return { getMyProfile, updateMyProfile }
}
