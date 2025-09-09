import { onMounted, onBeforeUnmount } from 'vue'

export function useStepTracker(ids: string[], setCurrent: (id: string) => void) {
  let io: IntersectionObserver | null = null

  onMounted(() => {
    const els = ids
      .map(id => (typeof document !== 'undefined' ? document.getElementById(id) : null) as HTMLElement | null)
      .filter((el): el is HTMLElement => !!el)

    io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target && (visible.target as HTMLElement).id) {
        setCurrent((visible.target as HTMLElement).id)
      }
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    })

    els.forEach((el) => io!.observe(el))
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
  })
}
