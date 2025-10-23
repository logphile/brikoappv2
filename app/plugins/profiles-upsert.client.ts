import { defineNuxtPlugin, useNuxtApp } from '#imports'

// Nuxt auto-imported composable from @nuxtjs/supabase (only if module installed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseClient: <T = any>() => T

export default defineNuxtPlugin(async () => {
  // Try official composable first; fallback to injected client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any = null
  try { supabase = useSupabaseClient<any>() } catch {}
  if (!supabase) {
    try { supabase = (useNuxtApp() as any).$supabase } catch {}
  }
  if (!supabase) return

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
