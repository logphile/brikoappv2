<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
  aspect?: string        // e.g. "16/9"
  initial?: number       // 0..1, default 0.5
  keyboardStep?: number  // default 0.04
}>()

const pct = ref(Math.min(1, Math.max(0, props.initial ?? 0.5)))
const root = ref<HTMLElement | null>(null)
const dragging = ref(false)

function clamp01(n: number) { return Math.min(1, Math.max(0, n)) }

function updateFromClientX(clientX: number) {
  if (!root.value) return
  const r = root.value.getBoundingClientRect()
  pct.value = clamp01((clientX - r.left) / r.width)
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  updateFromClientX(e.clientX)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  updateFromClientX(e.clientX)
}

function onPointerUp(e: PointerEvent) {
  dragging.value = false
  ;(e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
}

function onKeydown(e: KeyboardEvent) {
  const step = props.keyboardStep ?? 0.04
  if (e.key === 'ArrowLeft') { pct.value = clamp01(pct.value - step); e.preventDefault() }
  if (e.key === 'ArrowRight'){ pct.value = clamp01(pct.value + step); e.preventDefault() }
}

onMounted(() => {
  root.value?.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
})

onBeforeUnmount(() => {
  root.value?.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <!-- Aspect ratio ensures height; neutral bg avoids flash -->
  <div
    ref="root"
    class="relative w-full overflow-hidden rounded-2xl bg-black/10 select-none"
    :class="[`aspect-[${aspect || '16/9'}]` ]"
  >
    <!-- Base (BEFORE) full-bleed -->
    <img
      :src="beforeSrc"
      :alt="beforeAlt || ''"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      decoding="async"
      draggable="false"
    />

    <!-- Top (AFTER) clipped to pct -->
    <div class="absolute inset-0 overflow-hidden" :style="{ width: (pct * 100) + '%' }">
      <img
        :src="afterSrc"
        :alt="afterAlt || ''"
        class="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
        draggable="false"
      />
    </div>

    <!-- Handle & track -->
    <div
      class="absolute inset-y-0 flex items-center"
      :style="{ left: `calc(${(pct * 100)}% - 1px)`  }"
      @pointerdown.stop="onPointerDown"
      @keydown="onKeydown"
      role="none"
    >
      <!-- vertical bar -->
      <div class="h-full w-[2px] bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.2)]"></div>

      <!-- grabber (accessible button) -->
      <button
        class="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black shadow-lg border border-black/10
               focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95"
        role="slider"
        aria-label="Reveal comparison"
        aria-valuemin="0"
        :aria-valuenow="Math.round(pct*100)"
        aria-valuemax="100"
        tabindex="0"
      >
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs leading-none">↔</div>
      </button>
    </div>
  </div>
</template>
