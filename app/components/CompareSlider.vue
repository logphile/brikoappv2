<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

type Props = {
  start?: number
  label?: string
}
const props = withDefaults(defineProps<Props>(), { start: 50, label: 'Comparison slider' })

const root = ref<HTMLElement | null>(null)
const xPct = ref(Math.min(100, Math.max(0, props.start)))
let dragging = false
let frame: number | null = null

function pctFromClientX(clientX: number) {
  const el = root.value!
  const rect = el.getBoundingClientRect()
  const raw = ((clientX - rect.left) / rect.width) * 100
  return Math.min(100, Math.max(0, raw))
}

function schedulePaint() {
  if (frame != null) return
  frame = requestAnimationFrame(() => {
    frame = null
    root.value?.style.setProperty('--x', `${xPct.value}%`)
  })
}

function setFromEvent(e: PointerEvent) {
  xPct.value = pctFromClientX(e.clientX)
  schedulePaint()
}

function onPointerDown(e: PointerEvent) {
  dragging = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  setFromEvent(e)
}
function onPointerMove(e: PointerEvent) {
  if (!dragging) return
  setFromEvent(e)
}
function onPointerUp() {
  dragging = false
}

function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 5 : 1
  if (e.key === 'ArrowLeft') { xPct.value = Math.max(0, xPct.value - step); schedulePaint() }
  if (e.key === 'ArrowRight') { xPct.value = Math.min(100, xPct.value + step); schedulePaint() }
}

onMounted(() => {
  root.value?.style.setProperty('--x', `${xPct.value}%`)
})
onBeforeUnmount(() => {
  if (frame != null) cancelAnimationFrame(frame!)
})
</script>

<template>
  <div
    ref="root"
    class="relative select-none overflow-hidden rounded-2xl"
    aria-label="Image comparison"
  >
    <div class="pointer-events-none">
      <slot name="right" />
    </div>

    <div
      class="pointer-events-none absolute inset-0 will-change-[clip-path]"
      :style="{ clipPath: 'inset(0 calc(100% - var(--x, 50%)) 0 0)' }"
    >
      <slot name="left" />
    </div>

    <div
      class="absolute inset-y-0 w-[3px] -translate-x-1/2"
      :style="{ left: 'var(--x, 50%)' }"
      aria-hidden="true"
    >
      <div class="h-full bg-[#FF0062]/80 shadow-[0_0_12px_0_#FF0062]"></div>
    </div>

    <button
      class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 grid place-items-center"
      :style="{ left: 'var(--x, 50%)' }"
      :aria-label="label"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.round(xPct)"
      @keydown="onKey"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
      >
      <span
        class="h-10 w-10 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] ring-2 ring-[#FF0062] outline-none"
      />
      <svg class="pointer-events-none absolute h-5 w-5 -translate-x-[18px]" viewBox="0 0 24 24" fill="#FF0062">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <svg class="pointer-events-none absolute h-5 w-5 translate-x-[18px]" viewBox="0 0 24 24" fill="#FF0062">
        <path d="M9 6l6 6-6 6"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
button { cursor: grab; touch-action: none; }
button:active { cursor: grabbing; }
:host, img { -webkit-user-drag: none; user-select: none; }
</style>
