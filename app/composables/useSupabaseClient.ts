import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'

let _client: SupabaseClient | null = null

export function useSupabaseClient(): SupabaseClient {
  const cfg = useRuntimeConfig()
  if (!_client) {
    const url = cfg.public?.supabaseUrl || ''
    const key = cfg.public?.supabaseAnonKey || ''
    _client = createClient(url, key)
  }
  return _client
}
