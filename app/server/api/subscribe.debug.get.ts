import { defineEventHandler } from 'h3'
import { serverSupabase } from '@/server/utils/supa'
import { keyRole } from '@/server/utils/keyRole'

export default defineEventHandler(async () => {
  const url = process.env.NUXT_SUPABASE_URL
  const svc = process.env.NUXT_SUPABASE_SERVICE_ROLE
  const anon = process.env.NUXT_SUPABASE_ANON_KEY

  let db_ok = false
  let db_error: string | null = null

  try {
    const supa = serverSupabase()
    const ping = await supa.from('subscriptions').select('id').limit(1)
    db_ok = !ping.error
    db_error = ping.error?.message ?? null
  } catch (e: any) {
    db_error = e?.message || String(e)
  }

  return new Response(
    JSON.stringify({
      ok: true,
      env: {
        has_url: Boolean(url),
        service_role: keyRole(svc),
        anon_role: keyRole(anon)
      },
      db: { db_ok, db_error }
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  )
})
