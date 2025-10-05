import { useNuxtApp } from 'nuxt/app'

export async function signedUrl(path?: string | null, bucket = 'projects'): Promise<string | null> {
  if (!path) return null
  const { $supabase } = useNuxtApp() as any
  if (!$supabase) return null
  const key = path.startsWith(bucket + '/') ? path.slice(bucket.length + 1) : path
  const { data, error } = await $supabase.storage.from(bucket).createSignedUrl(key, 3600)
  return error ? null : (data?.signedUrl ?? null)
}
