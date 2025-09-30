import { useNuxtApp } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'

export type SaveParams = {
  file: Blob
  projectId: string
  title: string
  isPublic?: boolean // default false
  kind?: 'mosaic'|'voxel'|'avatar' // optional, defaults to 'mosaic'
}

/**
 * Save an image to the public Storage bucket and persist a DB row for the Gallery.
 *
 * Primary target (if exists): gallery_posts with columns { title, project_id, image_url, is_public }.
 * Fallback (current schema in this repo): user_projects with { id, user_id, title, kind, status, preview_path }.
 * If isPublic is true on fallback, we will also call publishProject() to set slug/cover when supported.
 */
export async function saveToGallery({ file, projectId, title, isPublic = false, kind = 'mosaic' }: SaveParams) {
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) throw new Error('Supabase unavailable')

  // must be logged in (RLS needs auth.uid())
  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user) throw new Error('Not signed in')

  // key must match your Storage policy. Keep no leading slash.
  const ext = (file as any)?.type === 'image/webp' ? 'webp' : ((file as any)?.type?.includes('png') ? 'png' : 'png')
  const key = `gallery/${user.id}/${projectId}-${Date.now()}.${ext}`

  // upload image
  {
    const { error: upErr } = await $supabase.storage
      .from('projects')
      .upload(key, file, {
        upsert: true,
        contentType: (file as any)?.type || 'image/png',
        cacheControl: '31536000'
      })
    if (upErr) throw new Error(`Upload: ${upErr.message}`)
  }

  // public URL (even for private DB rows)
  const { data: pub } = $supabase.storage.from('projects').getPublicUrl(key)
  const image_url = pub?.publicUrl || ''

  // Try gallery_posts first
  try {
    const payload = { title, project_id: projectId, image_url, is_public: !!isPublic }
    const { error: dbErr } = await $supabase.from('gallery_posts').insert(payload).select().single()
    if (dbErr) throw dbErr
    return { ok: true, image_url }
  } catch (err: any) {
    const msg = String(err?.message || '')
    const relationMissing = /relation\s+"?gallery_posts"?\s+does not exist/i.test(msg) || /42P01/.test(String(err?.code || ''))
    if (!relationMissing) {
      // real DB error in gallery_posts path
      throw new Error(`DB: ${err?.code ?? ''} ${err?.message ?? err}`)
    }
  }

  // Fallback: use user_projects table (schema used in this repo)
  const payload2: any = {
    id: projectId,
    user_id: user.id,
    title,
    kind,
    status: isPublic ? 'public' : 'private',
    preview_path: key,
    tags: []
  }
  const ins = await $supabase.from('user_projects').insert(payload2).select().single()
  if (ins.error) throw new Error(`DB: ${ins.error?.code ?? ''} ${ins.error?.message ?? ins.error}`)

  // If we need to publish (set slug/cover), call publishProject where supported
  if (isPublic) {
    try {
      const { publishProject } = useProjects()
      await publishProject(projectId, { title })
    } catch (e) {
      // non-fatal if slug/cover columns don't exist
      // console.warn('[saveToGallery] publish fallback failed', e)
    }
  }

  return { ok: true, image_url }
}
