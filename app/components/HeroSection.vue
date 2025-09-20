<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
// No props needed yet
// Bind image sources via runtime strings to prevent Vite from transforming into static imports during build
// Append a version query to bust CDN/browser caches when assets are replaced
const originalImg = '/demo-original.jpg?v=3'
const mosaicImg = '/demo-mosaic.jpg?v=3'

// Animate hero only when it comes into view
const inView = ref(false)
const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => {
  if (entry.isIntersecting) inView.value = true
}, { threshold: 0.15 })
</script>

<template>
  <div ref="sentinel" aria-hidden="true" class="h-px"></div>
  <Transition
    v-if="inView"
    appear
    enter-active-class="transition ease-out duration-700"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
  >
    <section class="relative overflow-hidden bg-[#0B1220] text-white">
      <div class="mx-auto max-w-7xl px-6 py-16 sm:py-20 text-left">
      <!-- Brand compact header (optional if already in layout) -->
      <!-- Headline -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.4] tracking-tight">
        Turn any picture into a brick build<span class="text-[#00E5A0]">!</span>
      </h1>

      <!-- Subtext -->
      <p class="mt-2 text-white/80 leading-[1.4] max-w-prose">
        Upload your favorite photo → see it transformed into a LEGO-style mosaic or 3D model → download parts &amp; cost in seconds.
      </p>

      <!-- CTAs -->
      <div class="mt-4 flex gap-3">
        <!-- Primary: Photo to Bricks -->
        <NuxtLink to="/mosaic" class="u-cta" aria-label="Try Photo to Bricks">Try Photo to Bricks</NuxtLink>
        <!-- Secondary: See Community -->
        <NuxtLink to="/studio" class="u-linkbtn group" aria-label="See Community">See Community <span class="arrow">→</span></NuxtLink>
      </div>

      <!-- Visual divider -->
      <div class="h-px w-24 bg-[#00E5A0] mx-auto my-10"></div>

      <!-- Demo: replace purple gradient with a simple before/after -->
      <div class="mt-12 grid gap-6 md:grid-cols-2 mx-auto max-w-4xl md:max-w-5xl justify-center">
        <!-- Original -->
        <figure class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            :src="originalImg"
            @error="(e) => ((e.target as HTMLImageElement).src = '/og-default.png')"
            alt="Original photo uploaded to Briko"
            class="w-full h-64 md:h-72 object-cover"
          />
          <figcaption class="px-4 py-3 text-sm text-gray-300">Original photo</figcaption>
        </figure>

        <!-- Mosaic Result -->
        <figure class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            :src="mosaicImg"
            @error="(e) => ((e.target as HTMLImageElement).src = '/demo-mosaic.png')"
            alt="Photo transformed into a LEGO-style mosaic"
            class="w-full h-64 md:h-72 object-cover"
          />
          <figcaption class="px-4 py-3 text-sm text-gray-300">
            LEGO-style mosaic preview — <span class="text-[#00E5A0]">made in seconds</span>
          </figcaption>
        </figure>
      </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
/* If you don't have icon fonts, remove i-lucide-* spans above and keep the labels only. */
</style>
