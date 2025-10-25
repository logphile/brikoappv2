import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || ''
  if (!supabaseUrl || !serviceKey) throw createError({ statusCode: 500, statusMessage: 'Supabase not configured' })
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, db: { schema: 'analytics' } })
  const { data, error } = await supabase.from('kpis_7d').select('*').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data || {}
})
