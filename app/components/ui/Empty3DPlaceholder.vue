<template>
  <div class="relative h-[480px] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30 grid place-items-center">
    <!-- faint voxel-ish grid using two rotated linear-gradients -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center space-y-3">
      <img :src="emptySrc" alt="" aria-hidden="true" class="mx-auto w-24 h-24 sm:w-32 sm:h-32 select-none" draggable="false" />
      <p class="text-white/80 text-sm">Upload an image to begin.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEmptyIcon } from '@/composables/useEmptyIcon'

const gridStyle = computed(() => ({
  backgroundImage: [
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 16px)',
    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 16px)'
  ].join(', '),
  backgroundSize: '16px 16px, 16px 16px'
}))

const emptySrc = useEmptyIcon()
</script>

<style>
/* no extra styles required */
</style>
