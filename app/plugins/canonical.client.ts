import { defineNuxtPlugin, useHead, useRoute, useRuntimeConfig, watchEffect } from '#imports'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const siteUrl = useRuntimeConfig().public.siteUrl || 'https://briko.app'
  watchEffect(() => {
    const url = new URL(route.fullPath, siteUrl).toString()
    useHead({
      link: [
        { rel: 'canonical', href: url, key: 'canonical' }
      ]
    })
  })
})
