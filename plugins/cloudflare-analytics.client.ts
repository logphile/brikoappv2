import { defineNuxtPlugin, useHead, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const token = useRuntimeConfig().public.cloudflareAnalyticsToken
  if (!token) return
  useHead({
    script: [
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        defer: true,
        'data-cf-beacon': `{"token":"${token}"}`
      } as any
    ]
  })
})
