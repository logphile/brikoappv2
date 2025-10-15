import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) {
    try {
      const d = (nuxtApp.$dayjs as any)?.()
      const ok = d && typeof d.from === 'function' && typeof d.fromNow === 'function'
      if (!ok) {
        // eslint-disable-next-line no-console
        console.error('[dayjs] relativeTime missing on injected instance')
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[dayjs] injected instance not available', e)
    }
  }
})
