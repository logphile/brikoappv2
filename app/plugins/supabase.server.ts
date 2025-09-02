import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = String((config.public as any).supabaseUrl || '')
  const key = String((config.public as any).supabaseAnonKey || '')

  type ProvideShape = { supabase: SupabaseClient | null, db: { available: boolean, supabase: SupabaseClient | null } }

  if (!url || !key) {
    console.warn('[briko] Supabase (server) disabled: missing env')
    const supabase: SupabaseClient | null = null
    const provide: ProvideShape = { supabase, db: { available: false, supabase } }
    return { provide }
  }

  const supabase: SupabaseClient | null = createClient(url, key)
  const provide: ProvideShape = { supabase, db: { available: true, supabase } }
  return { provide }
})
