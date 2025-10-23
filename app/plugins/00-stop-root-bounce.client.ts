import { defineNuxtPlugin } from '#imports'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

let mountedAt = 0
let allowHomeOnce = false

export default defineNuxtPlugin(() => {
  const router = useRouter()

  onMounted(() => {
    mountedAt = performance.now()

    // If user clicks the logo/home link, allow exactly one "/" nav
    window.addEventListener(
      'click',
      (e) => {
        const el = (e.target as HTMLElement | null)
        if (
          el &&
          el.closest('a[href="/"],a[href^="https://briko.app/"],a[href="https://briko.app"]')
        ) {
          allowHomeOnce = true
        }
      },
      { capture: true }
    )
  })

  router.beforeEach((to: any, from: any) => {
    if (typeof window === 'undefined') return

    const targetIsRoot = to.path === '/' || to.fullPath === '/'
    const browserNotRoot = !!window.location && window.location.pathname !== '/'
    const justLoaded = performance.now() - mountedAt < 2000 // ~2s window after load

    // Allow a single user-initiated home nav, then reset the flag
    if (targetIsRoot && allowHomeOnce) {
      allowHomeOnce = false
      return
    }

    // Block only suspicious auto-bounces right after load
    if (targetIsRoot && browserNotRoot && justLoaded) {
      const err = new Error(
        '[root-bounce] Blocked auto-nav to "/" while URL is ' + window.location.pathname
      )
      console.error(err.stack || err.message)
      return false
    }
  })
})
