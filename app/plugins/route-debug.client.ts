import { defineNuxtPlugin, useRouter, useRoute } from '#imports'
import { onMounted } from 'vue'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    console.log('[route-debug] BEFORE →', to.fullPath, 'from', from.fullPath)
  })

  router.afterEach((to, from) => {
    console.log('[route-debug] AFTER  →', to.fullPath, 'from', from.fullPath)
  })

  onMounted(() => {
    console.log('[route-debug] MOUNT @', useRoute().fullPath)
  })
})
