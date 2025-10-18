import { defineNitroPlugin } from 'nitro'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event: any) => {
    try {
      // Log the original URL Cloudflare hands us
      console.log('[ssr-trace] req →', event?.node?.req?.url)
    } catch {}
  })
})
