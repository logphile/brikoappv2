import { useNuxtApp } from 'nuxt/app'
import { ref, computed, watch } from 'vue'

export type GalleryItem = {
  id: string
  title: string
  image_url: string
  is_public: boolean
  created_at: string
}

export async function fetchMyGalleryPosts(): Promise<GalleryItem[]> {
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) return []

  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user) return []

  const { data, error } = await $supabase
    .from('gallery_posts')
    .select('id, title, image_url, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[My Gallery fetch]', error)
    return []
  }
  return (data as GalleryItem[]) || []
}

// Reactive variant for client pages: waits for auth to be ready and exposes refresh()
export function useMyGallery() {
  const { $supabase } = useNuxtApp() as any
  const items = ref<GalleryItem[]>([])
  const loading = ref(false)
  const userId = ref<string | null>(null)
  const ready = computed(() => !!userId.value)

  async function resolveUser() {
    try {
      if (!$supabase) return
      const { data } = await $supabase.auth.getUser()
      userId.value = data?.user?.id || null
    } catch {
      userId.value = null
    }
  }

  async function load() {
    if (!$supabase || !ready.value) return
    loading.value = true
    try {
      const { data, error } = await $supabase
        .from('gallery_posts')
        .select('id, title, image_url, is_public, created_at')
        .eq('user_id', userId.value!)
        .order('created_at', { ascending: false })
      if (error) throw error
      items.value = (data as GalleryItem[]) || []
    } catch (e) {
      // Surface errors in dev; keep silent in prod to avoid UX noise
      if (process.dev) console.error('[useMyGallery.load]', e)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  // Resolve user once on client mount
  if (process.client) resolveUser()
  // Load when auth becomes ready
  watch(ready, (ok) => { if (ok) load() }, { immediate: true })

  return { items, loading, ready, refresh: load }
}
