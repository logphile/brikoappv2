import { useNuxtApp } from 'nuxt/app'
import { ref, computed, watch } from 'vue'
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
  if (!$supabase) return []
  const { buildPreviewUrl } = useProjects()

  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user) return []

  // Query base table `projects` by owner
  // Select minimum columns to be schema-tolerant
  const { data, error } = await $supabase
    .from('projects')
    .select('id, title, preview_path, is_public, created_at, owner')
    .eq('owner', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[My Gallery fetch projects]', error)
    return []
  }
  const rows = (data || []) as Array<{ id:string; title:string; preview_path:string|null; is_public?:boolean; created_at:string }>
  return rows.map(r => ({
    id: r.id,
    title: r.title || 'Untitled',
    image_url: r.preview_path ? buildPreviewUrl(r.preview_path) : '',
    is_public: !!(r as any).is_public,
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
        .from('projects')
        .select('id, title, preview_path, is_public, created_at, owner')
        .eq('owner', userId.value!)
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data || []) as Array<{ id:string; title:string; preview_path:string|null; is_public?:boolean; created_at:string }>
      items.value = rows.map(r => ({
        id: r.id,
        title: r.title || 'Untitled',
        image_url: r.preview_path ? buildPreviewUrl(r.preview_path) : '',
        is_public: !!(r as any).is_public,
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

  // Resolve user once on client mount
  if (process.client) resolveUser()
  // Load when auth becomes ready
  watch(ready, (ok) => { if (ok) load() }, { immediate: true })

  return { items, loading, ready, refresh: load }
}
