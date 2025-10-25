<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  first?: string
  second?: string
  altFirst?: string
  altSecond?: string
}>(), {
  first: '/home-1-original.jpg',
  second: '/home-2-mosaic.png',
  altFirst: 'Original',
  altSecond: 'Mosaic'
})

const pos = ref(50)
const dragging = ref(false)

const startDrag = (e: MouseEvent | TouchEvent) => {
  dragging.value = true
  move(e)
}
const stopDrag = () => { dragging.value = false }
const move = (e: MouseEvent | TouchEvent) => {
  // allow pointermove even if not dragging (keyboard or programmatic)
  if (!dragging.value && !(e as any).clientX && !(e as any).touches) return
  const target = (e.target as HTMLElement)?.closest('[data-compare]') as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  const clientX = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX
  const pct = ((clientX - rect.left) / rect.width) * 100
  pos.value = Math.min(100, Math.max(0, pct))
}

onMounted(() => {
  const el = document.querySelector<HTMLElement>('[data-handle]')
  el?.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowLeft') { pos.value = Math.max(0, pos.value - 2) }
    if (ev.key === 'ArrowRight') { pos.value = Math.min(100, pos.value + 2) }
  })
})
</script>

<template>
  <div class="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-card">
    <div
      data-compare
      class="relative w-full aspect-[16/9] bg-black/10"
      @pointerdown="(e:any)=>{dragging=true; move(e)}"
      @pointermove="(e:any)=>move(e)"
      @pointerup="stopDrag"
      @pointerleave="stopDrag"
      @touchstart.passive="startDrag"
      @touchmove.passive="move"
      @touchend.passive="stopDrag"
    >
      <img :src="props.first" :alt="props.altFirst" class="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
        <img :src="props.second" :alt="props.altSecond" class="absolute inset-0 w-full h-full object-cover" draggable="false" />
      </div>

      <div class="absolute top-0 bottom-0 -translate-x-1/2 w-0.5 bg-white/90 shadow-[0_0_0_2px_rgba(0,0,0,.15)]" :style="{ left: pos + '%' }" aria-hidden="true" />

      <button
        data-handle
        type="button"
        :style="{ left: pos + '%' }"
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/70 text-white grid place-items-center focus:outline-none focus:ring-2 focus:ring-white/70"
        aria-label="Drag to compare images"
      >↔</button>
    </div>
  </div>
</template>
