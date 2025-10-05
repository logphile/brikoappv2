<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
  initial?: number       // 0..1
  keyboardStep?: number  // default 0.04
  debug?: boolean
  label?: string
}>()

const pct = ref(Math.min(1, Math.max(0, props.initial ?? 0.5)))
const root = ref<HTMLElement | null>(null)
const dragging = ref(false)
const ratio = ref<number | null>(null) // dynamic aspect-ratio (w/h)
const errBefore = ref(false)
const errAfter  = ref(false)

// Measure the BEFORE image to set the true aspect ratio
function measureAspect(url: string) {
  if (!url) { ratio.value = null; return }
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => {
    const w = img.naturalWidth || 1
    const h = img.naturalHeight || 1
    ratio.value = w / h
  }
  img.onerror = () => { ratio.value = null }
  img.src = url
}

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
function onPointerMove(e: PointerEvent) { if (dragging.value) updateFromClientX(e.clientX) }
function onPointerUp(e: PointerEvent) {
  dragging.value = false
  ;(e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
}

function onKeydown(e: KeyboardEvent) {
  const step = props.keyboardStep ?? 0.04
  if (e.key === 'ArrowLeft')  { pct.value = clamp01(pct.value - step); e.preventDefault() }
  if (e.key === 'ArrowRight') { pct.value = clamp01(pct.value + step); e.preventDefault() }
}

onMounted(() => {
  root.value?.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  measureAspect(props.beforeSrc)
})
onBeforeUnmount(() => {
  root.value?.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
watch(() => props.beforeSrc, (n) => {
  errBefore.value = false
  measureAspect(n)
})
watch(() => props.afterSrc, () => {
  errAfter.value = false
})
</script>

<template>
  <!-- Dynamic aspect-ratio keeps height perfect; min-h prevents initial collapse pre-measure -->
  <div
    ref="root"
    class="relative w-full overflow-hidden rounded-2xl bg-black/10 select-none"
    :style="{
      aspectRatio: ratio ? String(ratio) : undefined,
      minHeight: ratio ? undefined : '220px'
    }"
  >
    <!-- BEFORE base -->
    <img
      :src="beforeSrc"
      :alt="beforeAlt || ''"
      class="absolute inset-0 block w-full h-full object-cover object-center"
      loading="eager"
      decoding="async"
      draggable="false"
      @error="errBefore = true"
    />

    <!-- AFTER on top, clipped by pct -->
    <div class="absolute inset-0 overflow-hidden" :style="{ width: (pct * 100) + '%' }">
      <img
        :src="afterSrc"
        :alt="afterAlt || ''"
        class="absolute inset-0 block w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
        draggable="false"
        @error="errAfter = true"
      />
    </div>

    <!-- DEBUG BADGE (remove when verified) -->
    <div v-if="props.debug" class="absolute left-3 bottom-3 z-20 text-[11px] leading-4 px-2 py-1 rounded bg-black/65 text-white">
      <div class="opacity-80">{{ props.label || 'Slider' }}</div>
      <div>B: {{ beforeSrc.split('/').pop() }} <span v-if="errBefore" class="text-red-300">(err)</span></div>
      <div>A: {{ afterSrc.split('/').pop() }} <span v-if="errAfter" class="text-red-300">(err)</span></div>
    </div>

    <!-- Handle -->
    <div class="absolute inset-y-0 flex items-center" :style="{ left: `calc(${(pct * 100)}% - 1px)`  }">
      <div class="h-full w-[2px] bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.2)]"></div>
      <button
        class="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black shadow-lg border border-black/10
               focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95"
        role="slider"
        aria-label="Reveal comparison"
        aria-valuemin="0" :aria-valuenow="Math.round(pct*100)" aria-valuemax="100"
        tabindex="0"
        @pointerdown.stop="onPointerDown"
        @keydown="onKeydown"
      >
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs leading-none">↔</div>
      </button>
    </div>
  </div>
</template>
