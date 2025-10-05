import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'

export type GalleryItem = {
  id: string
  title: string
  image_url: string
  is_public: boolean
  created_at: string
}

export async function fetchMyGalleryPosts(): Promise<GalleryItem[]> {
  const { $supabase } = useNuxtApp() as any
  const { buildPreviewUrl } = useProjects()
  if (!$supabase) return []
  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user?.id) return []

  // Try modern schema (user_id/name/thumbnail_path)
  let res = await $supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (res.error) {
    // Fallback to legacy schema (owner/title/preview_path)
    res = await $supabase
      .from('projects')
      .select('*')
      .eq('owner', user.id)
      .order('created_at', { ascending: false })
  }
  if (res.error) {
    if (process.dev) console.error('[My Gallery fetch projects]', res.error)
    return []
  }
  const rows = (res.data || []) as any[]
  return rows.map((r:any) => ({
    id: r.id,
    title: r.title || r.name || 'Untitled',
    image_url: (r.preview_path || r.thumbnail_path) ? buildPreviewUrl(r.preview_path || r.thumbnail_path) : '',
    is_public: !!r.is_public,
    created_at: r.created_at,
  }))
}

// Reactive variant for client pages: waits for auth to be ready and exposes refresh()
export function useMyGallery() {
  const { $supabase } = useNuxtApp() as any
  const { buildPreviewUrl } = useProjects()
  const items = ref<GalleryItem[]>([])
  const loading = ref(false)
  const userId = ref<string | null>(null)
  const ready = computed(() => !!userId.value)

  async function load() {
    if (!$supabase || !ready.value) return
    loading.value = true
    try {
      // Try modern then legacy
      let q = await $supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId.value!)
        .order('created_at', { ascending: false })
      if (q.error) {
        q = await $supabase
          .from('projects')
          .select('*')
          .eq('owner', userId.value!)
          .order('created_at', { ascending: false })
      }
      if (q.error) throw q.error
      const rows = (q.data || []) as any[]
      items.value = rows.map((r:any) => ({
        id: r.id,
        title: r.title || r.name || 'Untitled',
        image_url: (r.preview_path || r.thumbnail_path) ? buildPreviewUrl(r.preview_path || r.thumbnail_path) : '',
        is_public: !!r.is_public,
        created_at: r.created_at,
      }))
    } catch (e) {
      // Surface errors in dev; keep silent in prod to avoid UX noise
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
  // Load when auth becomes ready
  watch(ready, (ok) => { if (ok) load() }, { immediate: true })

  return { items, loading, ready, refresh: load }
}
