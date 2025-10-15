export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) {
    try {
      const d = (nuxtApp.$dayjs as any)()
      if (typeof d?.from !== 'function' || typeof d?.fromNow !== 'function') {
        // eslint-disable-next-line no-console
        console.error('[dayjs] relativeTime not loaded on the active instance')
      }
    } catch {
      // eslint-disable-next-line no-console
      console.error('[dayjs] global instance not available')
    }
  }
})
