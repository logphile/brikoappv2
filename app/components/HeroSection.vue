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
    <section class="relative overflow-hidden bg-transparent text-brand-purple">
      <div class="mx-auto max-w-5xl px-6 pt-10 sm:pt-14">
      <!-- Inline-width wrapper aligns lines to H1 left edge while centering the block -->
      <div class="mx-auto w-fit">
        <!-- H1: single line, centered, no wrap, clamped size -->
        <h1
          class="block text-center font-brand font-bold leading-[1.05]
                 whitespace-nowrap
                 text-[clamp(28px,5.2vw,46px)]"
        >
          Create LEGO-style art from your images<span class="text-mint">!</span>
        </h1>

        <!-- Three lines: left-aligned, Material Symbols bullets before text -->
        <ul
          class="mt-6 md:mt-7
                 space-y-2 md:space-y-3
                 text-left text-[clamp(16px,3vw,20px)] leading-snug"
        >
          <li class="flex items-baseline gap-2">
            <span class="material-symbols-rounded text-brand-pink text-xl md:text-2xl" aria-hidden="true">chevron_right</span>
            <span>Upload your photo</span>
          </li>
          <li class="flex items-baseline gap-2">
            <span class="material-symbols-rounded text-brand-pink text-xl md:text-2xl" aria-hidden="true">chevron_right</span>
            <span>Instantly see it in bricks</span>
          </li>
          <li class="flex items-baseline gap-2">
            <span class="material-symbols-rounded text-brand-pink text-xl md:text-2xl" aria-hidden="true">chevron_right</span>
            <span>Get the parts, guide, and price</span>
          </li>
        </ul>
      </div>
      
      <!-- Visual divider -->
      <div class="h-px w-24 bg-[#00E5A0] mx-auto my-10"></div>

      <!-- Demo row: make cards ~40% larger, keep tidy alignment -->
      <section class="mt-8">
        <div class="mx-auto max-w-7xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Original -->
            <figure class="demo-card">
              <div class="media">
                <img
                  :src="originalImg"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/og-default.png')"
                  alt="Original photo uploaded to Briko"
                />
              </div>
              <figcaption class="caption">Original photo</figcaption>
            </figure>

            <!-- Mosaic Result -->
            <figure class="demo-card">
              <div class="media">
                <img
                  :src="mosaicImg"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/demo-mosaic.png')"
                  alt="Photo transformed into a LEGO-style mosaic"
                />
              </div>
              <figcaption class="caption">
                LEGO-style mosaic preview — <NuxtLink to="/mosaic" class="underline text-mint">made in seconds</NuxtLink>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
/* If you don't have icon fonts, remove i-lucide-* spans above and keep the labels only. */

/* Demo cards sized by grid; make each fill its column */
.demo-card { @apply w-full rounded-2xl bg-white/5 border border-white/10 shadow-soft overflow-hidden; }
.demo-card .media { aspect-ratio: 4 / 3; @apply overflow-hidden; }
.demo-card .media img { @apply w-full h-full object-cover block; }
.demo-card .caption { @apply px-4 py-3 text-center text-brand-purple bg-white/5; }

/* Snap-in rise with a tiny squish */
@keyframes briko-step-in {
  0%   { transform: translateY(10px) scaleY(.98); opacity: 0; }
  60%  { transform: translateY(0)    scaleY(1.01); opacity: 1; }
  100% { transform: translateY(0)    scaleY(1); }
}
/* apply */
ul > li { animation: briko-step-in .36s ease-out both; }
ul > li:nth-child(2) { animation-delay: .06s; }
ul > li:nth-child(3) { animation-delay: .12s; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  ul > li { animation: none !important; }
}
</style>
