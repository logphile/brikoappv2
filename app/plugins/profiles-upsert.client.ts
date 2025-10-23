import { defineNuxtPlugin, useSupabaseClient } from 'nuxt/app'

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient<any>()

  async function upsertProfile(user: any) {
    try {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: user?.user_metadata?.full_name ?? null,
        avatar_url: user?.user_metadata?.avatar_url ?? null,
      })
    } catch (e) {
      console.warn('[profiles-upsert] failed', e)
    }
  }

  try {
    const { data } = await supabase.auth.getUser()
    if (data?.user) await upsertProfile(data.user)
  } catch {}

  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) upsertProfile(user)
    })
  } catch {}
})
