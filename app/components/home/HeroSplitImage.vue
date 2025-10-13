<script setup lang="ts">
defineProps<{
  originalSrc: string
  mosaicSrc: string
  alt?: string
}>()
</script>

<template>
  <div
    class="relative w-full max-w-[520px] aspect-[4/3] rounded-2xl overflow-hidden
           shadow-xl border border-[#343434]/25 bg-black/10"
  >
    <!-- Left: original -->
    <img :src="originalSrc" :alt="alt || ''"
         class="absolute inset-0 h-full w-full object-cover" loading="eager" fetchpriority="high" />

    <!-- Right: mosaic overlay, clipped to right half -->
    <img :src="mosaicSrc" :alt="alt || ''"
         class="absolute inset-0 h-full w-full object-cover [clip-path:inset(0_0_0_50%)]" />

    <!-- Center divider -->
    <div class="absolute left-1/2 top-3 bottom-3 w-px bg-white/80 mix-blend-soft-light"></div>

    <!-- Soft inner vignette so text beside it stays readable -->
    <div class="pointer-events-none absolute inset-0 ring-1 ring-black/5"></div>
  </div>
</template>
