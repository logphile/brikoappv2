import { useNuxtApp } from 'nuxt/app'

export type SavePayload = {
  name: string
  original_path?: string | null
  thumbnail_path: string | null
  mosaic_path?: string | null
  width?: number | null
  height?: number | null
  data?: Record<string, any>
}

// Save a private owner project into the base `projects` table.
// Uses our actual columns: owner, title, preview_path, is_public.
export async function saveToGalleryPrivate(p: SavePayload) {
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) throw new Error('Supabase unavailable')
  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user?.id) throw new Error('Not signed in')

  const row: any = {
    owner: user.id,
    title: p.name ?? null,
    preview_path: p.thumbnail_path ?? null,
    width: p.width ?? null,
    height: p.height ?? null,
    is_public: false,
  }

  const { data, error } = await $supabase
    .from('projects')
    .insert(row)
    .select('id')
    .single()
  if (error) throw error

  const { error: e2 } = await $supabase
    .from('projects')
    .select('id')
    .eq('id', data.id)
    .single()
  if (e2) throw e2

  return data.id as string
}
