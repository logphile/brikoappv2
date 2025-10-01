import { useNuxtApp } from 'nuxt/app'

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
