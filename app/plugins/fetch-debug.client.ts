import { defineNuxtPlugin } from 'nuxt/app'

// Logs any browser fetch to your Supabase project. Temporary debug utility.
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const orig = window.fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = String(typeof input === 'string' ? input : (input as any)?.toString?.() || '')
      const isSupabase = /\.supabase\.co\//.test(url)
      if (isSupabase) {
        let hasAuth = false
        const h = init?.headers as any
        if (h) {
          if (h instanceof Headers) hasAuth = !!h.get('Authorization')
          else hasAuth = !!h.Authorization || !!h.authorization || !!h['Authorization']
        }
        // Don’t print the token; just whether it exists.
        // Example: [SB FETCH] POST https://xxx.supabase.co/rest/v1/projects auth: present
        // eslint-disable-next-line no-console
        console.log('[SB FETCH]', (init?.method || 'GET'), url, 'auth:', hasAuth ? 'present' : 'missing')
      }
    } catch {}
    return orig(input as any, init)
  }
})
