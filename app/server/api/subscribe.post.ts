import { defineEventHandler, readBody } from 'h3'
import { serverSupabase } from '@/server/utils/supa'
import { keyRole } from '@/server/utils/keyRole'
import { z } from 'zod'

const Body = z.object({ email: z.string().email() })

export default defineEventHandler( async (event) => {
  try {
    const { email } = Body.parse(await readBody(event))

    // assert service role
    const role = keyRole(process.env.NUXT_SUPABASE_SERVICE_ROLE)
    if (role !== 'service_role') {
      console.error('[subscribe] WRONG_KEY:', role)
      return new Response(JSON.stringify({ ok:false, code:'WRONG_KEY' }), { status: 500 })
    }

    const supa = serverSupabase()

    const { error } = await supa
      .from('subscriptions')
      .upsert({ email, source: 'site' }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) {
      console.error('[subscribe] DB_ERROR:', error.message, error.details, error.hint)
      return new Response(JSON.stringify({ ok:false, code:'DB', message: error.message }), {
        status: 409, headers: { 'content-type':'application/json' }
      })
    }

    return new Response(JSON.stringify({ ok:true }), { status: 200, headers: { 'content-type':'application/json' } })
  } catch (e:any) {
    console.error('[subscribe] UNHANDLED:', e?.message || e)
    if (e?.name === 'ZodError') return new Response(JSON.stringify({ ok:false, code:'INVALID_EMAIL' }), { status: 422 })
    return new Response(JSON.stringify({ ok:false, code:'UNKNOWN' }), { status: 500 })
  }
})
