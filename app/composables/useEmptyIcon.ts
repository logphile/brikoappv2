import { computed } from 'vue'
import { useBreakpoints } from '@vueuse/core'

export const useEmptyIcon = () => {
  // Use VueUse breakpoints; treat < 640px as "mobile"
  const bp = useBreakpoints({ sm: 640 })
  const isMobile = bp.smaller('sm')
  return computed(() => isMobile.value
    ? '/brand/empty/briko-empty-upload-96.png'
    : '/brand/empty/briko-empty-upload-128.png'
  )
}
