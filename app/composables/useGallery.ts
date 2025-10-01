import { useNuxtApp } from 'nuxt/app'
import { useProjects } from '@/composables/useProjects'

export type PublishOpts = {
  file: Blob
  projectId: string
  title: string
  isPublic?: boolean // default false
  kind?: 'mosaic'|'voxel'|'avatar' // optional, defaults to 'mosaic'
}

// Upload to Storage at projects bucket under gallery/<uid>/... with an RLS-safe guard
export async function uploadGalleryImage(file: Blob, projectId: string) {
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) throw new Error('Supabase unavailable')
  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user) throw new Error('Please sign in to publish.')

  const bucket = 'projects'
  const isWebp = (file as any)?.type === 'image/webp'
  const isPng = String((file as any)?.type || '').includes('png')
  const ext = isWebp ? 'webp' : (isPng ? 'png' : 'png')
  const key = `gallery/${user.id}/${projectId}-${Date.now()}.${ext}`.replace(/^\/+/, '')

  // Sanity + RLS guard (avoid fighting bucket policy)
  // MUST be gallery/<uid>/...
  console.log('[publish:path]', { bucket, key, uid: user.id })
  if (!new RegExp(`^gallery/${user.id}/`).test(key)) {
    throw new Error('Bad path (expected gallery/<uid>/...)')
  }

  const { error: upErr } = await $supabase.storage.from(bucket).upload(key, file, {
    upsert: true,
    contentType: (file as any)?.type || 'image/png',
    cacheControl: '31536000',
  })
  if (upErr) throw new Error(`Upload: ${upErr.message}`)

  const { data: pub } = $supabase.storage.from(bucket).getPublicUrl(key)
  return { key, image_url: pub?.publicUrl as string }
}

/**
 * Save an image to the public Storage bucket and persist a DB row for the Gallery.
 *
 * Primary target (if exists): gallery_posts { title, project_id, image_url, is_public }.
 * Fallback (repo schema): user_projects { id, user_id, title, kind, status, preview_path }.
 * If isPublic is true on fallback, also call publishProject() to set slug/cover when supported.
 */
export async function saveToGallery({ file, projectId, title, isPublic = false, kind = 'mosaic' }: PublishOpts) {
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) throw new Error('Supabase unavailable')

  // must be logged in (RLS needs auth.uid())
  const { data: auth } = await $supabase.auth.getUser()
  const user = auth?.user
  if (!user) throw new Error('Not signed in')

  // Upload image first (RLS-safe)
  const { key, image_url } = await uploadGalleryImage(file, projectId)

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
    }
  }

  return { ok: true, image_url }
}
