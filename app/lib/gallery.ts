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

  // Extended row (newer schema): includes optional paths, dimensions, and JSONB data
  const row: any = {
    owner: user.id,
    title: p.name ?? null,
    preview_path: p.thumbnail_path ?? null,
    // optional fields (may not exist in older schemas)
    original_path: p.original_path ?? null,
    mosaic_path: p.mosaic_path ?? null,
    width: p.width ?? null,
    height: p.height ?? null,
    data: p.data ?? {},
    is_public: false,
  }
  // Minimal fallback row for older schemas
  const minimal: any = {
    owner: user.id,
    title: p.name ?? null,
    preview_path: p.thumbnail_path ?? null,
    is_public: false,
  }

  // Try extended insert first, fall back if columns are missing
  let rec: any
  let ins = await $supabase
    .from('projects')
    .insert(row)
    .select('id')
    .single()
  if (ins.error) {
    const msg = String(ins.error.message || '')
    if (/column .* does not exist/i.test(msg)) {
      ins = await $supabase
        .from('projects')
        .insert(minimal)
        .select('id')
        .single()
      if (ins.error) throw ins.error
      rec = ins.data
    } else {
      throw ins.error
    }
  } else {
    rec = ins.data
  }

  // Read-back guard so we only show success if RLS allows viewing our row
  const echo = await $supabase
    .from('projects')
    .select('id')
    .eq('id', rec.id)
    .single()
  if (echo.error) throw echo.error

  return rec.id as string
}
