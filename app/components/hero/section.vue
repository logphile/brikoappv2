<script setup lang="ts">
// Safe slider refs using existing public assets (no 404s on case-sensitive hosts)
// If you later add app/assets/hero/*.webp, you can switch to Vite imports for hashing.
const slides = [
  { src: '/home-1-mosaic.png?v=2', alt: 'LEGO-style example 1' },
  { src: '/home-1-original.jpg?v=2', alt: 'LEGO-style example 2' },
  { src: '/home-2-mosaic.png?v=1', alt: 'LEGO-style example 3' }
]
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
    <!-- Left copy -->
    <div class="space-y-6">
      <h1 class="text-[56px] leading-[0.95] font-extrabold text-[#2F3061]">
        Create LEGO-style art from your images
      </h1>
      <ul class="space-y-3 text-[#2F3061]">
        <li class="flex items-center gap-3">
          <span class="i-mdi-home-outline text-pink-600"></span>
          <span>Upload your photo</span>
        </li>
        <li class="flex items-center gap-3">
          <span class="i-mdi-grid text-pink-600"></span>
          <span>Instantly see it in bricks</span>
        </li>
        <li class="flex items-center gap-3">
          <span class="i-mdi-file-download-outline text-pink-600"></span>
          <span>Get the parts, guide, and price</span>
        </li>
      </ul>
    </div>

    <!-- Right slider (static render for now; transition can be added after) -->
    <div class="relative rounded-3xl overflow-hidden ring-1 ring-[#2F3061]/10 shadow-lg aspect-[4/3] bg-yellow-300/40">
      <img
        v-for="(s, i) in slides"
        :key="i"
        :src="s.src"
        :alt="s.alt"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  </section>
</template>
