<template>
  <div class="relative h-[360px] rounded-xl overflow-hidden ring-1 ring-[#343434]/20 bg-[#2F3061] grid place-items-center">
    <!-- faint mosaic grid -->
    <div class="absolute inset-0 opacity-25 pointer-events-none" :style="gridStyle"></div>
    <div class="relative z-10 text-center">
      <span class="material-symbols-rounded block mx-auto text-[64px] text-[#FF0062]" aria-hidden="true">cloud_upload</span>
      <p class="text-[#FFD808]/80 text-sm mt-4">Upload a photo to see your mosaic.</p>
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
/* no extra styles required */
</style>
