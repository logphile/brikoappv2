<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = withDefaults(defineProps<{
  left: string
  right: string
  altLeft?: string
  altRight?: string
  initial?: number
  aspect?: string          // "16/9" or "4/3"
  class?: string
}>(), {
  altLeft: 'Before',
  altRight: 'After',
  initial: 50,
  aspect: '16/9'
})

const pos = ref(Math.max(0, Math.min(100, props.initial)))
const dragging = ref(false)
let id = 0
const root = ref<HTMLElement>()

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || !root.value) return
  const r = root.value.getBoundingClientRect()
  pos.value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
}
const onPointerUp = () => { dragging.value = false }

const onPointerDown = (e: PointerEvent) => {
  dragging.value = true
  ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
  onPointerMove(e)
}

onMounted(() => {
  id = Math.floor(Math.random() * 1e9)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <div class="rounded-2xl overflow-hidden" :class="props.class">
    <div
      ref="root"
      class="relative w-full bg-black/5 select-none min-h-[180px] z-10"
      :style="{ aspectRatio: props.aspect, touchAction: 'none' }"
      role="region"
      aria-label="Image comparison slider"
      @pointerdown="onPointerDown"
    >
      <!-- Base (left) -->
      <img :src="left" :alt="altLeft"
           class="absolute inset-0 w-full h-full object-cover" draggable="false" />

      <!-- Clipped (right) -->
      <div class="absolute inset-0 overflow-hidden" :style="{ width: pos + '%' }">
        <img :src="right" :alt="altRight"
             class="absolute inset-0 w-full h-full object-cover" draggable="false" />
      </div>

      <!-- Divider + handle -->
      <div :style="{ left: pos + '%' }"
           class="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-white/90 shadow-[0_0_0_2px_rgba(0,0,0,.15)]" />
      <button
        type="button"
        :style="{ left: pos + '%' }"
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full
               bg-black/70 text-white grid place-items-center focus:outline-none focus:ring-2 focus:ring-white/80"
        aria-label="Drag to compare"
      >↔</button>
    </div>
  </div>
</template>
