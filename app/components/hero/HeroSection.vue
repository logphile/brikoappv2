<script setup lang="ts">
// Safe slider refs from public/slider (absolute paths; no bundler transforms)
const slides = [
  { src: '/slider/slide-1.jpg', alt: 'slide 1' },
  { src: '/slider/slide-2.jpg', alt: 'slide 2' },
  { src: '/slider/slide-3.jpg', alt: 'slide 3' }
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
