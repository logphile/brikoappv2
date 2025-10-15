import { ref, watch } from 'vue'
// Use official Nuxt Supabase composables
declare const useSupabaseClient: <T = any>() => T
declare const useSupabaseUser: <T = any>() => any

export function useProfile() {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser<any>()

  const profile = ref<{
    id: string
    handle: string | null
    display_name: string | null
    profile_visibility: 'public' | 'private'
  } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadProfile() {
    if (!user?.value) return
    loading.value = true; error.value = null
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, handle, display_name, profile_visibility')
      .eq('id', user.value.id)
      .single()
    if (err) error.value = err.message
    profile.value = (data as any) || {
      id: user.value.id,
      handle: null,
      display_name: null,
      profile_visibility: 'public' as const
    }
    loading.value = false
  }

  async function saveProfile(patch: Partial<Omit<NonNullable<typeof profile.value>, 'id'>>) {
    if (!user?.value) return { data: null, err: new Error('Not authenticated') }
    loading.value = true; error.value = null
    const payload = { id: user.value.id, ...(profile.value || {}), ...patch }
    const { data, error: err } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single()
    if (err) error.value = err.message
    profile.value = (data as any) || (payload as any)
    loading.value = false
    return { data, err }
  }

  watch(user, () => { try { loadProfile() } catch {} }, { immediate: true })

  return { profile, loading, error, loadProfile, saveProfile }
}
