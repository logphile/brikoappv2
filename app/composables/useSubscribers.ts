import { useNuxtApp } from '#imports'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseClient: <T = any>() => T

export async function subscribeEmail(email: string) {
  if (!email || !String(email).trim()) return
  if (import.meta.server) throw new Error('subscribeEmail must run client-side')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any = null
  try { supabase = useSupabaseClient<any>() } catch {}
  if (!supabase) supabase = (useNuxtApp() as any)?.$supabase
  if (!supabase) throw new Error('Supabase client unavailable')

  const addr = String(email).trim().toLowerCase().slice(0, 320)
  const row: any = { email: addr, created_at: new Date().toISOString() }
  const { error } = await supabase
    .from('subscribers')
    .upsert(row, { onConflict: 'email' })
  if (error) throw error
}
