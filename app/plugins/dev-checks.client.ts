import { defineNuxtPlugin, useNuxtApp } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    try {
      const { $dayjs } = useNuxtApp()
      const ok = typeof (($dayjs as any)()?.fromNow) === 'function'
      if (!ok) {
        // eslint-disable-next-line no-console
        console.warn('[dayjs] relativeTime not attached yet; helpers will attach on demand.')
      }
    } catch {}
  }
})
