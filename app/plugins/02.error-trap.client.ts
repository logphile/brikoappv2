import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const orig = nuxtApp.vueApp.config.errorHandler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    // eslint-disable-next-line no-console
    console.error('[Vue error]', err, { info, instance })
    if ((err as any)?.stack) {
      // eslint-disable-next-line no-console
      console.error('[stack]', (err as any).stack)
    }
    orig?.(err as any, instance as any, info as any)
  }
})
