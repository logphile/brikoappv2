import { readBody, getRequestURL, setResponseStatus, defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || ''

  if (!supabaseUrl || !serviceKey) {
    setResponseStatus(event, 500)
    return { ok: false, error: 'Supabase not configured' }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    db: { schema: 'analytics' },
  })
  const body = (await readBody(event)) || {}

  const url = getRequestURL(event)
  const row = {
    user_id: null as string | null,
    event: String(body.event || '').slice(0, 64),
    path: body.path || url.pathname || null,
    ref: body.ref || url.searchParams.get('ref') || null,
    project_id: body.project_id || null,
    props: body.props || {},
  }

  if (!row.event) {
    setResponseStatus(event, 400)
    return { ok: false, error: 'Missing event' }
  }

  const { error } = await supabase.from('events').insert(row as any)
  if (error) {
    setResponseStatus(event, 500)
    return { ok: false, error: error.message }
  }
  return { ok: true }
})
