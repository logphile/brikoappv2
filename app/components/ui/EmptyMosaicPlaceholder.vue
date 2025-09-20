<template>
  <div class="relative h-[480px] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30 grid place-items-center">
    <!-- faint mosaic grid -->
    <div class="absolute inset-0 opacity-25 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center space-y-3">
      <img :src="emptySrc" alt="" aria-hidden="true" class="mx-auto w-24 h-24 sm:w-32 sm:h-32 select-none" draggable="false" />
      <p class="text-white/80 text-sm">Upload a photo to generate your mosaic.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEmptyIcon } from '@/composables/useEmptyIcon'

const gridStyle = computed(() => ({
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  backgroundSize: '16px 16px, 16px 16px'
}))

const emptySrc = useEmptyIcon()
</script>

<style>
/* no extra styles required */
</style>
