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

  const { data, error } = await supabase
    .from('events')
    .select('created_at,event')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Aggregate client-side into day/event counts
  const map = new Map<string, number>()
  for (const row of (data || []) as any[]) {
    const day = new Date(row.created_at).toISOString().slice(0, 10)
    const key = `${day}|${row.event}`
    map.set(key, (map.get(key) || 0) + 1)
  }
  const out: { day: string; event: string; n: number }[] = []
  for (const [key, n] of map.entries()) {
    const [day, event] = key.split('|')
    out.push({ day, event, n })
  }
  out.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : a.event.localeCompare(b.event)))
  return out
})
