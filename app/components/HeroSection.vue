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
      <div class="mx-auto max-w-5xl px-6 pt-10 sm:pt-14">
      <!-- H1: single line, centered, no wrap, clamped size -->
      <h1
        class="mx-auto block text-center font-brand font-bold leading-[1.05]
               whitespace-nowrap
               text-[clamp(34px,6vw,52px)]"
      >
        Turn any picture into a brick build<span class="text-mint">!</span>
      </h1>

      <!-- Three lines: left-aligned, clamped size, mint arrows -->
      <ul
        class="mt-4 sm:mt-5 space-y-2 text-left
               text-[clamp(22px,4.2vw,30px)] leading-snug"
      >
        <li>
          <span>Upload your favorite photo</span>
          <span class="text-mint"> →</span>
        </li>
        <li>
          <span>See it transformed into a LEGO-style mosaic or 3D model</span>
          <span class="text-mint"> →</span>
        </li>
        <li>
          <span>Download parts, build guide &amp; cost in seconds!</span>
          <span class="text-mint"> →</span>
        </li>
      </ul>
      
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

/* Snap-in rise with a tiny squish */
@keyframes briko-step-in {
  0%   { transform: translateY(10px) scaleY(.98); opacity: 0; }
  60%  { transform: translateY(0)    scaleY(1.01); opacity: 1; }
  100% { transform: translateY(0)    scaleY(1); }
}
/* Arrow nudge, like a stud sliding in */
@keyframes briko-arrow-nudge {
  0%,100% { transform: translateX(0); }
  50%     { transform: translateX(4px); }
}
/* apply */
ul > li { animation: briko-step-in .36s ease-out both; }
ul > li:nth-child(2) { animation-delay: .06s; }
ul > li:nth-child(3) { animation-delay: .12s; }
ul > li > .text-mint { display:inline-block; animation: briko-arrow-nudge .9s ease-out 1 .18s; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  ul > li, ul > li > .text-mint { animation: none !important; }
}
</style>
