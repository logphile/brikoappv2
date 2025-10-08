// SSR-safe wrapper for Supabase client
// Returns null on server; real client on client
// Usage:
// const supabase = useSupabaseSafeClient()
// if (supabase) { /* client-only logic */ }
// Nuxt auto-imported composable from @nuxtjs/supabase (client only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useSupabaseClient: <T = any>() => T

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabaseSafeClient<T = any>() {
  if (import.meta.server) return null as unknown as T
  const client = useSupabaseClient<T>()
  return client
}
