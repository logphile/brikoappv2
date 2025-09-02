import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseAnonKey as string

  // If keys are missing, don’t initialize; expose a no-op client.
  if (!url || !key) {
    console.warn('[briko] Supabase disabled: missing env')
    return {
      provide: {
        supabase: null as SupabaseClient | null,
        db: { available: false, supabase: null as SupabaseClient | null }
      }
    }
  }

  const supabase = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  })
  return {
    provide: {
      supabase: supabase as SupabaseClient | null,
      db: { available: true, supabase: supabase as SupabaseClient | null }
    }
  }
})
