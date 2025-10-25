import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (_event) => {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || ''
  if (!supabaseUrl || !serviceKey) throw createError({ statusCode: 500, statusMessage: 'Supabase not configured' })
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, db: { schema: 'analytics' } })

  const q = getQuery(_event as any) as any
  const days = Math.max(1, Math.min(90, Number(q?.days ?? 7)))
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const since = cutoff.toISOString()

  async function countEvent(name: string): Promise<number> {
    const { count, error } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('event', name)
    if (error) throw error
    return count || 0
  }

  const [uploads, mosaics, saves, pdf, png, csv] = await Promise.all([
    countEvent('upload_start'),
    countEvent('mosaic_generated'),
    countEvent('save_project'),
    countEvent('export_pdf'),
    countEvent('export_png'),
    countEvent('export_csv'),
  ])

  return { uploads, mosaics, saves, pdf, png, csv }
})
