<template>
  <div class="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10">
    <!-- base image (right/original) -->
    <img :src="right" alt="" class="block w-full h-auto select-none pointer-events-none" />
    <!-- reveal pane (left/mosaic) – fully rendered, clipped by width -->
    <div class="absolute inset-0 overflow-hidden" :style="{ width: percent + '%' }">
      <img :src="left" alt="" class="block w-full h-auto select-none pointer-events-none" />
    </div>

    <!-- handle: thinner (12px) -->
    <div class="absolute inset-y-0" :style="{ left: `calc(${percent}% - 6px)` }">
      <div class="h-full w-[12px] mx-auto rounded bg-black/40 backdrop-blur-sm ring-1 ring-white/40"></div>
    </div>

    <input
      class="absolute inset-0 w-full opacity-0 cursor-ew-resize"
      type="range" min="0" max="100" v-model.number="percent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  left: string
  right: string
  start?: number
}>()
// Start centered; no animation
const percent = ref<number>(props.start ?? 50)
</script>
