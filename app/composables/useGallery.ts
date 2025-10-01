import { useNuxtApp } from 'nuxt/app'

export type PublishOpts = {
  file: Blob
  projectId: string
  title: string
  isPublic?: boolean // default false
}

// Prefer Nuxt-provided client ($supabase)
async function useClient() {
  const { $supabase } = useNuxtApp() as any
  if ($supabase) return $supabase
  throw new Error('Supabase unavailable')
}

// Upload to Storage (projects bucket) under gallery/<uid>/... with an RLS-safe guard, as PNG
export async function uploadGalleryImage(file: Blob, projectId: string) {
  const supabase = await useClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) throw new Error('Please sign in to publish.')

  const bucket = 'projects'
  const key = `gallery/${user.id}/${projectId}-${Date.now()}.png`.replace(/^\/+/, '')

  // Sanity + RLS guard (avoid fighting bucket policy)
  // MUST be gallery/<uid>/...
  if (!new RegExp(`^gallery/${user.id}/`).test(key)) {
    throw new Error('Bad path (expected gallery/<uid>/...)')
  }

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(key, file, {
      upsert: true,
      contentType: 'image/png',
      cacheControl: '31536000',
    })
  if (upErr) throw new Error(`Upload: ${upErr.message}`)

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key)
  return { key, image_url: pub?.publicUrl as string }
}

/**
 * Save an image to the public Storage bucket and persist a DB row in gallery_posts.
 */
export async function saveToGallery({ file, projectId, title, isPublic = false }: PublishOpts) {
  const supabase = await useClient()
  // Upload image first (RLS-safe)
  const { image_url } = await uploadGalleryImage(file, projectId)

  const { error } = await supabase
    .from('gallery_posts')
    .insert({
      title: title || 'Untitled',
      project_id: projectId,
      image_url,
      is_public: !!isPublic,
      // user_id set by trigger if present
    })
    .select()
    .single()
  if (error) throw new Error(`DB: ${error.code ?? ''} ${error.message}`)

  return { image_url }
}
