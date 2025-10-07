import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { useSupabaseClient } from './useSupabaseClient'

export function useSupabaseUser(): Ref<User | null> {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  let unsub: { unsubscribe: () => void } | null = null

  const init = async () => {
    if (import.meta.server) return
    try {
      const { data } = await supabase.auth.getUser()
      user.value = data.user ?? null
    } catch {
      user.value = null
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
    unsub = data?.subscription ?? null
  }

  onMounted(init)
  onBeforeUnmount(() => {
    try { unsub?.unsubscribe() } catch {}
  })

  return user
}
