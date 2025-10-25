<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  left: string
  right: string
  altLeft?: string
  altRight?: string
  initial?: number
  aspect?: string
}>(), {
  altLeft: 'Before',
  altRight: 'After',
  initial: 50,
  aspect: '16/9'
})

const pos = ref(Math.min(100, Math.max(0, props.initial)))
const dragging = ref(false)
const aspectStyle = computed(() => ({ aspectRatio: props.aspect }))

const start = (e: PointerEvent) => {
  dragging.value = true
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
  move(e)
}
const stop = () => { dragging.value = false }
const move = (e: PointerEvent) => {
  if (!dragging.value) return
  const root = e.currentTarget as HTMLElement
  const rect = root.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  pos.value = Math.max(0, Math.min(100, pct))
}
</script>

<template>
  <div class="rounded-2xl overflow-hidden">
    <div
      class="relative w-full bg-black/5 select-none min-h-[180px]"
      :style="aspectStyle"
      role="region"
      aria-label="Image comparison slider"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="stop"
      @pointerleave="stop"
    >
      <img :src="left" :alt="altLeft" class="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
        <img :src="right" :alt="altRight" class="absolute inset-0 w-full h-full object-cover" draggable="false" />
      </div>

      <div :style="{ left: pos + '%' }" class="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-white/90 shadow-[0_0_0_2px_rgba(0,0,0,.15)]" />
      <button
        type="button"
        :style="{ left: pos + '%' }"
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/70 text-white grid place-items-center shadow ring-0 focus:outline-none focus:ring-2 focus:ring-white/80"
        aria-label="Drag to compare"
      >↔</button>
    </div>
  </div>
  
</template>
