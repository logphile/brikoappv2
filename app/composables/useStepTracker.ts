import { onMounted, onBeforeUnmount } from 'vue'

// Deterministic, header-aware tracker: the active step is the last section
// whose top is above the viewport offset (like typical docs TOC behavior).
export function useStepTracker(
  ids: string[],
  setCurrent: (id: string) => void,
  headerPx = 72
) {
  let ticking = false

  const compute = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const scrollTop = (typeof window !== 'undefined' ? window.scrollY : 0) + headerPx + 8
      let active = ids[0]
      for (const id of ids) {
        const el = (typeof document !== 'undefined') ? document.getElementById(id) as HTMLElement | null : null
        if (!el) continue
        const top = el.getBoundingClientRect().top + (typeof window !== 'undefined' ? window.scrollY : 0)
        if (top <= scrollTop) active = id
        else break
      }
      setCurrent(active)
      ticking = false
    })
  }

  onMounted(() => {
    compute()
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', compute, { passive: true })
      window.addEventListener('resize', compute)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  })
}
