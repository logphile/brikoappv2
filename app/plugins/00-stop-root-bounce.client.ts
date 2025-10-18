import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to, from) => {
    // If the browser URL isn't "/" but some code tries to navigate to "/",
    // cancel it and log a stack so we can see who asked.
    if (typeof window !== 'undefined') {
      const targetIsRoot = to.path === '/' || to.fullPath === '/'
      const browserNotRoot = window.location && window.location.pathname !== '/'
      if (targetIsRoot && browserNotRoot) {
        // Print a stack to locate the offender
        const err = new Error('[root-bounce] Blocked nav to "/" while URL is ' + window.location.pathname)
        console.error(err.stack || err.message)
        return false // cancels this navigation
      }
    }
  })
})
