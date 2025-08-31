import { computed } from 'vue'
import { useState } from 'nuxt/app'

export const usePalette = () => {
  const colors = useState('lego-colors', () => [] as any[])
  const loaded = computed(() => colors.value.length > 0)

  const load = async () => {
    if (loaded.value) return
    const res = await fetch('/data/lego_colors.json')
    const json = await res.json()
    colors.value = json.colors
  }

  const nearest = (rgb: [number, number, number]) => {
    let best = colors.value[0], min = Infinity
    for (const c of colors.value) {
      const d = (c.rgb[0]-rgb[0])**2 + (c.rgb[1]-rgb[1])**2 + (c.rgb[2]-rgb[2])**2
      if (d < min) { min = d; best = c }
    }
    return best
  }

  return { load, nearest, colors, loaded }
}
