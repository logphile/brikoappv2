<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  a: { src: string; alt?: string }
  b: { src: string; alt?: string }
  // seconds between swaps
  intervalSec?: number
  // aspect ratio like '16/9' or '4/3'
  aspect?: string
}>()

const showA = ref(true)
const timer = ref<number | null>(null)
const isHover = ref(false)
const loadedA = ref(false)
const loadedB = ref(false)

// Preload images so the first swap isn't blank
function preload(url: string | undefined, flag: (v: boolean) => void) {
  if (!url) return
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => flag(true)
  img.onerror = () => flag(true) // don't block if it 404s
  img.src = url
}

function start() {
  stop()
  const ms = Math.max(1, (props.intervalSec ?? 2.5)) * 1000
  timer.value = window.setInterval(() => {
    if (!isHover.value && loadedA.value && loadedB.value) {
      showA.value = !showA.value
    }
  }, ms)
}
function stop() {
  if (timer.value != null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

onMounted(() => {
  preload(props.a?.src, v => (loadedA.value = v))
  preload(props.b?.src, v => (loadedB.value = v))
  start()
})
onBeforeUnmount(stop)

watch(() => [props.a?.src, props.b?.src], () => {
  loadedA.value = false
  loadedB.value = false
  preload(props.a?.src, v => (loadedA.value = v))
  preload(props.b?.src, v => (loadedB.value = v))
  showA.value = true
  start()
})
</script>

<template>
  <!-- Aspect ratio guarantees height; bg avoids flash -->
  <div
    class="relative w-full overflow-hidden rounded-2xl bg-black/10"
    :class="[`aspect-[${aspect || '16/9'}]` ]"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <!-- A -->
    <img
      v-if="a?.src"
      :src="a.src"
      :alt="a.alt || ''"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      :class="showA ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'"
      loading="eager"
      decoding="async"
    />
    <!-- B -->
    <img
      v-if="b?.src"
      :src="b.src"
      :alt="b.alt || ''"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      :class="!showA ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'"
      loading="eager"
      decoding="async"
    />

    <!-- Minimal debug label (remove after verify) -->
    <div class="absolute bottom-2 right-3 z-20 text-[11px] px-2 py-1 rounded bg-black/60 text-white">
      {{ showA ? a?.src : b?.src }}
    </div>
  </div>
</template>
