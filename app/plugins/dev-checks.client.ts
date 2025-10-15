import dayjs from 'dayjs'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) {
    try {
      const d1 = (nuxtApp.$dayjs as any)?.()
      const d2 = (dayjs as any)?.()
      const ok1 = d1 && typeof d1.from === 'function' && typeof d1.fromNow === 'function'
      const ok2 = d2 && typeof d2.from === 'function' && typeof d2.fromNow === 'function'
      if (!ok1 || !ok2) {
        // eslint-disable-next-line no-console
        console.error('[dayjs] relativeTime missing on active instance(s)', { ok1, ok2 })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[dayjs] global instance not available', e)
    }
  }
})
