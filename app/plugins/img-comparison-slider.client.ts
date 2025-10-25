// Registers the <img-comparison-slider> web component on the client.
// Robust to environments where the npm package isn't installed by
// attempting a runtime import and falling back to a CDN ESM build.
// Library: https://github.com/sneas/img-comparison-slider
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return
  if (!('customElements' in window)) return

  const load = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.type = 'module'
      s.src = src
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed: ${src}`))
      document.head.appendChild(s)
    })

  try {
    if (!customElements.get('img-comparison-slider')) {
      await load('https://cdn.jsdelivr.net/npm/img-comparison-slider@8/dist/index.min.js')
      try { (window as any).__icsLoaded = true } catch {}
    }
  } catch {
    if (!customElements.get('img-comparison-slider')) {
      await load('/vendor/img-comparison-slider/index.min.js')
    }
  }
})
