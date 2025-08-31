import { createClient } from '@supabase/supabase-js'
import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '#imports'
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey

  // If keys are missing, don’t initialize; expose a no-op client.
  if (!url || !key) {
    console.warn('[briko] Supabase disabled: missing env')
    return {
      provide: {
        supabase: null as any,
        db: { available: false }
      }
    }
  }

  const supabase = createClient(url, key)
  return {
    provide: {
      supabase,
      db: { available: true, supabase }
    }
  }
})
