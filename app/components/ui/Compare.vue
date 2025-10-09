<template>
  <!-- default to 16/9, can be overridden via prop -->
  <div
    class="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10"
    :class="ratioClass"
  >
    <!-- Right/original: full size, fixed -->
    <img
      :src="right"
      alt=""
      class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
    />

    <!-- Left/mosaic: full size, clipped by clip-path so it never shrinks -->
    <img
      :src="left"
      alt=""
      class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      :style="{ clipPath: `inset(0 ${100 - percent}% 0 0)`  }"
    />

    <!-- Handle (12px thick) -->
    <div class="absolute inset-y-0" :style="{ left: `calc(${percent}% - 6px)`  }">
      <div class="h-full w-[12px] mx-auto rounded bg-black/40 backdrop-blur-sm ring-1 ring-white/40"></div>
    </div>

    <!-- Drag surface -->
    <input
      class="absolute inset-0 w-full opacity-0 cursor-ew-resize"
      type="range" min="0" max="100" v-model.number="percent"
      aria-label="Compare slider"
    />
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  left: string
  right: string
  start?: number
  ratio?: '16/9' | '4/3' | '1/1' | '3/2'
}>(), { start: 50, ratio: '16/9' })

const percent = ref<number>(props.start)
const ratioClass = computed(() => {
  const map: Record<string, string> = {
    '16/9': 'aspect-[16/9]',
    '4/3':  'aspect-[4/3]',
    '1/1':  'aspect-square',
    '3/2':  'aspect-[3/2]',
  }
  return map[props.ratio] || 'aspect-[16/9]'
})
</script>
