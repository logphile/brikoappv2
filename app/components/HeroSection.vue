<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
// No props needed yet

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
    <section class="relative overflow-hidden bg-transparent text-[#343434]">
      <div class="mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <!-- Left side: stacked CTA and bullets -->
          <div class="flex flex-col items-start space-y-6">
            <h1 class="text-[5.57rem] md:text-[5.57rem] font-brand font-bold leading-[0.95] balance max-w-[15ch]">
              Create<br />
              LEGO‑style<br />
              art from<br />
              your images
            </h1>

            <ul class="space-y-3 text-lg">
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-brand-pink text-2xl" aria-hidden="true">upload_file</span>
                <span>Upload your photo</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-brand-pink text-2xl" aria-hidden="true">grid_view</span>
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-brand-pink text-2xl" aria-hidden="true">inventory_2</span>
                <span>Get the parts, guide, and price</span>
              </li>
            </ul>
          </div>

          <!-- Right side: before/after slider -->
          <div class="relative w-full max-w-2xl lg:max-w-[44rem] mx-auto">
            <div class="relative overflow-hidden rounded-3xl border-2 border-[#343434] shadow-[0_12px_32px_rgba(0,0,0,0.18)] bg-[#F5F4F1]/10 h-[360px] md:h-[460px]">
              <ClientOnly>
                <HeroDemo :original-src="'/briko-champloo.jpg?v=1'" :mosaic-src="'/briko-champloo-2.jpg?v=1'" :fixed-height="true" />
                <template #fallback>
                  <div class="h-full w-full bg-white/5 border border-white/10 rounded-2xl" />
                </template>
              </ClientOnly>
              <div class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10"></div>
            </div>
          </div>
        </div>
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
