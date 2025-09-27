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
    <section class="relative overflow-hidden bg-[#FFD808] text-[#343434]">
      <div class="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <!-- Left side: stacked CTA and bullets -->
          <div class="flex flex-col items-start space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-14 mt-10 md:mt-14 lg:mt-16 xl:mt-20">
            <h1 class="text-[5.57rem] md:text-[5.57rem] font-brand font-bold leading-[0.92] balance max-w-[14ch]">
              Create<br />
              LEGO‑style<br />
              art from<br />
              your images
            </h1>

            <ul class="space-y-3 text-lg leading-relaxed">
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-pink text-2xl mr-2" aria-hidden="true">upload_file</span>
                <span class="text-[#2F3061]">Upload your photo</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-pink text-2xl mr-2" aria-hidden="true">grid_view</span>
                <span class="text-[#2F3061]">Instantly see it in bricks</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-rounded text-pink text-2xl mr-2" aria-hidden="true">inventory_2</span>
                <span class="text-[#2F3061]">Get the parts, guide, and price</span>
              </li>
            </ul>

            <!-- Hero reassurance microcopy -->
            <p class="mt-2 text-sm text-[#2F3061]">Free to try -- no signup required.</p>
          </div>

          <!-- Right side: before/after slider -->
          <div class="relative w-full max-w-[48rem] lg:max-w-[52rem] mx-auto">
            <div class="relative overflow-hidden rounded-[22px] border border-[rgba(52,52,52,0.2)] shadow-lg ring-1 ring-[#343434]/20 bg-[#F5F4F1]/10 h-[360px] md:h-[460px]">
              <ClientOnly>
                <HeroDemo :original-src="'/home-1-original.jpg'" :mosaic-src="'/home-1-mosaic.png'" :fixed-height="true" />
                <template #fallback>
                  <div class="h-full w-full bg-white/5 border border-white/10 rounded-2xl" />
                </template>
              </ClientOnly>
              <div class="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-[#343434]/20"></div>
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
