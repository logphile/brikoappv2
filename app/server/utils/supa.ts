import { createClient } from '@supabase/supabase-js'

export function serverSupabase() {
  const url = process.env.NUXT_SUPABASE_URL
  const key = process.env.NUXT_SUPABASE_SERVICE_ROLE
  if (!url || !key) throw new Error('SUPABASE_ENV_MISSING')
  return createClient(url, key, { auth: { persistSession: false } })
}
