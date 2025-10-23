import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export async function getSupabase(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event).catch(() => null)
  return { client, user }
}
