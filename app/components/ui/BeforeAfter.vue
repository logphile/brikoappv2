<template>
  <div ref="wrap" class="relative w-full select-none briko-slider" :style="{ height: heightPx }" @mousedown="onDown" @touchstart.passive="onDown">
    <!-- After (original) full background -->
    <img :src="afterUrl" alt="after" class="absolute inset-0 w-full h-full object-contain" loading="lazy" decoding="async" />

    <!-- Before (mosaic) clipped on the left -->
    <div class="absolute inset-0 overflow-hidden" :style="{ width: clipWidth }">
      <img :src="beforeUrl" alt="before" class="absolute inset-0 w-full h-full object-contain" loading="lazy" decoding="async" />
    </div>

    <!-- Slider handle (pink theme) -->
    <div class="absolute top-0 bottom-0 group" :style="{ left: clipWidth }">
      <div class="rail -translate-x-1/2 h-full w-[3px] rounded"></div>
      <div class="handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-xs shadow transition text-white">
        ⇆
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps<{ beforeUrl: string; afterUrl: string; height?: number }>()
const wrap = ref<HTMLElement | null>(null)
const pos = ref(0.5) // 0..1

const heightPx = computed(() => `${Math.max(180, Math.min(1080, props.height || 480))}px`)
const clipWidth = computed(() => `${Math.round((wrap.value?.clientWidth || 0) * pos.value)}px`)

function setPosFromEvent(e: MouseEvent | TouchEvent){
  const el = wrap.value
  if(!el) return
  const rect = el.getBoundingClientRect()
  const clientX = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX
  const x = Math.max(rect.left, Math.min(rect.right, clientX))
  pos.value = (x - rect.left) / Math.max(1, rect.width)
}

function onMove(e: MouseEvent | TouchEvent){
  e.preventDefault()
  setPosFromEvent(e)
}

function onUp(){
  window.removeEventListener('mousemove', onMove as any)
  window.removeEventListener('touchmove', onMove as any)
  window.removeEventListener('mouseup', onUp)
  window.removeEventListener('touchend', onUp)
}

function onDown(e: MouseEvent | TouchEvent){
  setPosFromEvent(e)
  window.addEventListener('mousemove', onMove as any)
  window.addEventListener('touchmove', onMove as any, { passive: false } as any)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchend', onUp)
}

onBeforeUnmount(onUp)
</script>
