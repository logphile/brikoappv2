<script setup lang="ts">
// Simple variant: show one image (can rotate later)
const src = '/home-1-mosaic.png'
</script>

<template>
  <div class="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
    <picture>
      <!-- Optional: add <source type="image/webp"> in the future -->
      <img
        :src="src"
        alt=""
        class="w-full h-full object-cover opacity-90"
        loading="eager"
        fetchpriority="high"
      />
    </picture>

    <!-- subtle vignette/gradient so text stays readable -->
    <div class="absolute inset-0 bg-gradient-to-tr from-brand-yellow/40 via-brand-yellow/20 to-transparent"></div>
  </div>
</template>
