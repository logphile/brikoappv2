import type { SupabaseClient } from '@supabase/supabase-js'
import { useNuxtApp } from 'nuxt/app'

// Nuxt will auto-import useSupabaseClient when @nuxtjs/supabase is installed.
// Declare the symbol for TS to avoid editor complaints if types lag.
declare const useSupabaseClient: <T = any>() => T

export function useBrikoSupabase() {
  let client: SupabaseClient | null = null
  try {
    client = useSupabaseClient<SupabaseClient>()
  } catch {
    // ignore — fall back to plugin
  }
  if (!client) {
    const { $supabase } = useNuxtApp() as any
    client = ($supabase as SupabaseClient | null) || null
  }
  if (!client) throw new Error('Supabase client not initialized')
  return client
}
