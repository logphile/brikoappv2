<template>
  <div class="relative h-[480px] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30 grid place-items-center">
    <!-- faint mosaic grid -->
    <div class="absolute inset-0 opacity-25 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center space-y-3">
      <img src="/samples/parrot-32.png" alt="Sample" class="mx-auto w-24 h-24 rounded-md ring-1 ring-white/10 image-pixelated" />
      <p class="text-white/80 text-sm">Upload a photo to generate your mosaic.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const gridStyle = computed(() => ({
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  backgroundSize: '16px 16px, 16px 16px'
}))
</script>

<style>
.image-pixelated{ image-rendering: pixelated; }
</style>
