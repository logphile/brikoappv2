import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'

export type MyProjectRow = {
  id: string
  user_id: string
  name: string | null
  is_public: boolean
  created_at: string
  thumbnail_path?: string | null
  mosaic_path?: string | null
  original_path?: string | null
}

// Reactive variant for client pages: waits for auth to be ready and exposes refresh()
export function useMyGallery() {
  const { $supabase } = useNuxtApp() as any
  const items = ref<MyProjectRow[]>([])
  const loading = ref(false)
  const userId = ref<string | null>(null)
  const ready = computed(() => !!userId.value)

  async function load() {
    if (!$supabase || !ready.value) return
    loading.value = true
    try {
      // Modern schema: user_id/name/thumbnail_path
      const q = await $supabase
        .from('projects')
        .select('id, user_id, name, thumbnail_path, mosaic_path, original_path, is_public, created_at')
        .eq('user_id', userId.value!)
        .order('created_at', { ascending: false })
      if (q.error) throw q.error
      items.value = (q.data || []) as MyProjectRow[]
    } catch (e) {
      if (process.dev) console.error('[useMyGallery.load]', e)
      items.value = []
    } finally {
      loading.value = false
    }
  }
  async function resolveUser(){
    try {
      if (!$supabase) return
      const { data } = await $supabase.auth.getUser()
      userId.value = data?.user?.id || null
    } catch { userId.value = null }
  }
  if (process.client) onMounted(() => { resolveUser() })
  watch(ready, (ok) => { if (ok) load() }, { immediate: true })

  return { items, loading, ready, refresh: load }
}
