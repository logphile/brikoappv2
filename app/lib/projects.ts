import { useSupabaseClient, useSupabaseUser } from '#imports'

export type SavePayload = {
  id?: string
  name?: string | null
  thumbnail_path: string | null
  mosaic_path: string | null
  original_path: string | null
  is_public: boolean
}

export async function saveProject(payload: SavePayload) {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  if (!user.value) throw new Error('Not signed in')

  const row = {
    id: payload.id,
    user_id: user.value.id,
    name: payload.name ?? null,
    thumbnail_path: payload.thumbnail_path,
    mosaic_path: payload.mosaic_path,
    original_path: payload.original_path,
    is_public: payload.is_public,
  }

  const query = payload.id
    ? supabase.from('projects').upsert(row, { onConflict: 'id' })
    : supabase.from('projects').insert(row)

  const { error } = await query
  if (error) throw error
}
