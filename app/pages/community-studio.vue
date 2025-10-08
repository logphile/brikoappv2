<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <!-- Hero with blurred preview thumbnails behind login gate -->
    <section class="relative overflow-hidden rounded-2xl">
      <div class="absolute inset-0">
        <!-- Mosaic of sample images -->
        <div class="grid grid-cols-3 gap-2 p-2 opacity-35 blur-2xl">
          <img :src="sliderOriginal" alt="preview" class="h-36 w-full object-cover rounded-lg" />
          <img :src="sliderMosaic" alt="preview" class="h-36 w-full object-cover rounded-lg" />
          <img :src="demoOriginal" alt="preview" class="h-36 w-full object-cover rounded-lg" />
          <img :src="demoMosaic" alt="preview" class="h-36 w-full object-cover rounded-lg" />
          <img :src="lgSliderOrig" alt="preview" class="h-36 w-full object-cover rounded-lg" />
          <img :src="lgSliderMosaic" alt="preview" class="h-36 w-full object-cover rounded-lg" />
        </div>
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
      </div>

      <div class="relative z-10 card-glass p-6 md:p-8">
        <h1 class="text-2xl font-semibold">Community Studio</h1>
        <p class="opacity-80 text-sm">Explore public builds and remixes from the Briko community.</p>
        <p class="mt-2 text-white/80 text-sm">See trending builds, remixes, and fan favorites.</p>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <NuxtLink to="/gallery" class="btn-pink focus-cyber">Open Community Gallery</NuxtLink>
          <NuxtLink to="/login" class="btn-ivory-outline focus-cyber">Log in to create your Studio</NuxtLink>
          <NuxtLink to="/projects" class="btn-ivory-outline focus-cyber">Your Projects</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

useHead({
  title: 'Community Studio',
  meta: [
    { name: 'description', content: 'Explore public builds and remixes from the Briko community.' },
    { property: 'og:title', content: 'Community Studio | Briko' },
    { property: 'og:description', content: 'Explore public builds and remixes from the Briko community.' },
    { property: 'og:url', content: 'https://briko.app/community-studio' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Community Studio | Briko' },
    { name: 'twitter:description', content: 'Explore public builds and remixes from the Briko community.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/community-studio' }
  ]
})

// Use public URL strings for images to avoid Vite treating them as module imports
const sliderOriginal = '/slider-original.jpg'
const sliderMosaic   = '/slider-mosaic.jpg'
const demoOriginal   = '/demo-original.jpg'
const demoMosaic     = '/demo-mosaic.jpg'
const lgSliderOrig   = '/lg-slider-original.jpg'
const lgSliderMosaic = '/large-slider-mosaic.jpg'
</script>
