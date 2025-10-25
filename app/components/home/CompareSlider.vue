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
const root = ref<HTMLElement>()

const onMove = (e: PointerEvent) => {
  if (!dragging.value || !root.value) return
  const r = root.value.getBoundingClientRect()
  pos.value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
}
const onUp = () => { dragging.value = false }

const onDown = (e: PointerEvent) => {
  dragging.value = true
  ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
  onMove(e)
}

onMounted(() => {
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
})
</script>

<template>
  <div class="rounded-2xl overflow-hidden" :class="props.class">
    <div
      ref="root"
      class="relative w-full bg-black/5 min-h-[180px] select-none z-10"
      :style="{ aspectRatio: props.aspect, touchAction: 'none' }"
      role="region"
      aria-label="Image comparison slider"
      @pointerdown="onDown"
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
      <div :style="{ left: pos + '%' }" class="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-white/90" />
      <button
        type="button"
        :style="{ left: pos + '%' }"
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/70 text-white grid place-items-center"
        aria-label="Drag to compare"
      >↔</button>
    </div>
  </div>
</template>
