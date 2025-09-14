<template>
  <div class="relative h-[480px] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30 grid place-items-center">
    <!-- faint voxel-ish grid using two rotated linear-gradients -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center space-y-3">
      <img src="/samples/parrot-32.png" alt="Sample" class="mx-auto w-24 h-24 rounded-md ring-1 ring-white/10 image-pixelated" />
      <p class="text-white/80 text-sm">Upload an image to begin.</p>
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
</script>

<style>
.image-pixelated{ image-rendering: pixelated; }
</style>
