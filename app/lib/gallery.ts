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
  if (import.meta.server) throw new Error('saveToGalleryPrivate must run client-side')
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) throw new Error('Supabase unavailable')
  // Hard guard: require an authenticated session before touching DB
  const { data: sessionRes } = await $supabase.auth.getSession()
  const session = sessionRes?.session
  if (!session?.user?.id) throw new Error('Not signed in')

  // Extended row (newer schema): includes optional paths, dimensions, and JSONB data
  // Preferred (modern) schema: user_id/name/thumbnail_path/public_id
  const modern: any = {
    user_id: session.user.id,
    name: p.name ?? null,
    original_path: p.original_path ?? null,
    thumbnail_path: p.thumbnail_path ?? null,
    mosaic_path: p.mosaic_path ?? null,
    width: p.width ?? null,
    height: p.height ?? null,
    data: p.data ?? {},
    is_public: false,
    public_id: null,
  }
  // Legacy schema fallback: owner/title/preview_path
  const legacy: any = {
    owner: session.user.id,
    title: p.name ?? null,
    original_path: p.original_path ?? null,
    preview_path: p.thumbnail_path ?? null,
    mosaic_path: p.mosaic_path ?? null,
    width: p.width ?? null,
    height: p.height ?? null,
    data: p.data ?? {},
    is_public: false,
  }

  // Debug breadcrumb (temporary)
  try { console.table([{ user: session.user.id, to: 'projects', row_data_keys: Object.keys(modern) }]) } catch {}

  // Try modern insert first, fall back to legacy if columns are missing
  let rec: any
  let ins = await $supabase
    .from('projects')
    .insert(modern)
    .select('id')
    .single()
  if (ins.error) {
    console.error('[insert projects] error', ins.error)
    const msg = String(ins.error.message || '')
    if (/column .* does not exist/i.test(msg)) {
      // Retry with legacy mapping
      try { console.table([{ user: session.user.id, to: 'projects', row_data_keys: Object.keys(legacy) }]) } catch {}
      ins = await $supabase
        .from('projects')
        .insert(legacy)
        .select('id')
        .single()
      if (ins.error) {
        console.error('[insert projects legacy] error', ins.error)
        throw ins.error
      }
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
  if (echo.error) {
    console.error('[read-back projects] error', echo.error)
    throw echo.error
  }

  return rec.id as string
}
