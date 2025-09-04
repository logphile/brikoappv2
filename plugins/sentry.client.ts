import { defineNuxtPlugin, useHead, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const dsn = useRuntimeConfig().public.sentryDsn
  if (!dsn) return
  useHead({
    script: [
      {
        src: 'https://browser.sentry-cdn.com/7.114.0/bundle.tracing.min.js',
        crossorigin: 'anonymous'
      } as any,
      {
        // init with conservative sampling
        innerHTML: `try{Sentry&&Sentry.init({dsn: '${dsn}',integrations:[new Sentry.BrowserTracing()],tracesSampleRate:0.01});}catch(e){}`
      }
    ]
  })
})
