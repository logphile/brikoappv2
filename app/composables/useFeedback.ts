import { useNuxtApp } from '#imports'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseClient: <T = any>() => T

export async function submitFeedback(message: string, email?: string) {
  if (!message || !message.trim()) return
  if (import.meta.server) throw new Error('submitFeedback must run client-side')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any = null
  try { supabase = useSupabaseClient<any>() } catch {}
  if (!supabase) supabase = (useNuxtApp() as any)?.$supabase
  if (!supabase) throw new Error('Supabase client unavailable')

  let userId: string | null = null
  try { userId = (await supabase.auth.getUser())?.data?.user?.id || null } catch {}
  const row: any = {
    message: String(message).slice(0, 5000),
    email: email && String(email).slice(0, 320),
    user_id: userId,
    created_at: new Date().toISOString()
  }
  const { error } = await supabase.from('feedback').insert(row)
  if (error) throw error
}
