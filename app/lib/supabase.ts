import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from 'nuxt/app'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const config = useRuntimeConfig()
  const url = String((config.public as any).supabaseUrl || '')
  const key = String((config.public as any).supabaseAnonKey || '')
  if (!url || !key) throw new Error('Supabase not configured')
  client = createClient(url, key)
  return client
}

export function publicUrl(storagePath: string) {
  const supabase = getSupabase()
  const { data } = supabase.storage.from('public').getPublicUrl(storagePath)
  return data.publicUrl
}
