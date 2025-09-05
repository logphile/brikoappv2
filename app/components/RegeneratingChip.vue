<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useMosaicStore } from '@/stores/mosaic'

const m = useMosaicStore()

// avoid flicker: only show if active >150ms
const show = ref(false)
let t: ReturnType<typeof setTimeout> | null = null

const active = computed(() => m.status === 'working' || m.status === 'tiling')

watch(active, (isActive) => {
  if (isActive) {
    if (t) clearTimeout(t)
    t = setTimeout(() => (show.value = true), 150)
  } else {
    if (t) clearTimeout(t)
    show.value = false
  }
})

// a11y live region
const liveMsg = computed(() =>
  active.value
    ? (m.mode === 'auto' ? 'Regenerating mosaic' : 'Generating mosaic')
    : 'Mosaic ready'
)
</script>

<template>
  <div class="sr-only" aria-live="polite">{{ liveMsg }}</div>

  <Transition name="fade">
    <div
      v-if="show"
      class="pointer-events-none absolute top-3 right-3 z-10
             rounded-full bg-white/10 backdrop-blur px-3 py-1.5
             text-xs font-medium text-white ring-1 ring-white/20
             flex items-center gap-2"
    >
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"/>
      </svg>
      <span>{{ m.mode === 'auto' ? 'Regenerating…' : 'Generating…' }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
