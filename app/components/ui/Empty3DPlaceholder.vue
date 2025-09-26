<template>
  <div class="relative h-[480px] rounded-xl overflow-hidden ring-1 ring-[#343434]/20 bg-[#2F3061] grid place-items-center">
    <!-- faint voxel-ish grid using two rotated linear-gradients -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center">
      <span class="material-symbols-rounded block mx-auto text-[64px] text-[#FF0062]" aria-hidden="true">cloud_upload</span>
      <p class="text-[#FFD808]/80 text-sm mt-4">Upload a photo to see your 3D bricks.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const gridStyle = computed(() => ({
  backgroundImage: [
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 16px)',
    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 16px)'
  ].join(', '),
  backgroundSize: '16px 16px, 16px 16px'
}))

// icon is rendered via Material Symbols in the template
</script>

<style>
/* no extra styles required */
</style>
