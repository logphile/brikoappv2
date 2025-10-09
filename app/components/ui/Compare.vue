<template>
  <div
    class="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10"
    :style="{ backgroundColor: 'transparent' }"
  >
    <img :src="right" alt="" class="block w-full select-none pointer-events-none" />
    <div class="absolute inset-0 overflow-hidden" :style="{ width: percent + '%' }">
      <img :src="left" alt="" class="block w-full select-none pointer-events-none" />
    </div>

    <!-- handle -->
    <div class="absolute inset-y-0" :style="{ left: `calc(${percent}% - 12px)` }">
      <div class="h-full w-[24px] mx-auto rounded bg-black/40 backdrop-blur-sm ring-1 ring-white/40"></div>
    </div>

    <input
      class="absolute inset-0 w-full opacity-0 cursor-ew-resize"
      type="range" min="0" max="100" v-model.number="percent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  left: string   // mosaic
  right: string  // original
  start?: number // 0..100
}>()

const percent = ref<number>(props.start ?? 50)
</script>
