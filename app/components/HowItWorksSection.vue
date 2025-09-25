<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import ButtonPrimary from '@/components/ui/ButtonPrimary.vue'
import ButtonOutline from '@/components/ui/ButtonOutline.vue'

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
    <section class="bg-transparent text-[#343434]">
      <div class="mx-auto max-w-6xl px-6 pt-14 sm:pt-16 pb-0">
      <!-- Unified Section Header -->
      <SectionHeader
        title="How it works"
        subtitle="Four quick steps from photo to bricks."
      />

      <!-- Stepper (mono sticker: number + icon in one pill, copy on right) -->
      <div class="relative mt-10">
        <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Four steps to create your brick build">
          <li class="flex items-start gap-3">
            <!-- Sticker -->
            <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-2 bg-sun border border-black/5 shadow-[0_6px_20px_-6px_rgba(0,0,0,.25)]">
              <span class="text-sm font-semibold text-ink/90">1</span>
              <span class="material-symbols-rounded w-5 h-5 text-ink" aria-hidden="true">file_upload</span>
            </div>
            <!-- Copy -->
            <div class="text-sm leading-snug text-[#343434]">Upload a photo</div>
          </li>

          <li class="flex items-start gap-3">
            <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-2 bg-sun border border-black/5 shadow-[0_6px_20px_-6px_rgba(0,0,0,.25)]">
              <span class="text-sm font-semibold text-ink/90">2</span>
              <span class="material-symbols-rounded w-5 h-5 text-ink" aria-hidden="true">palette</span>
            </div>
            <div class="text-sm leading-snug text-[#343434]">Pick size &amp; palette</div>
          </li>

          <li class="flex items-start gap-3">
            <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-2 bg-sun border border-black/5 shadow-[0_6px_20px_-6px_rgba(0,0,0,.25)]">
              <span class="text-sm font-semibold text-ink/90">3</span>
              <span class="material-symbols-rounded w-5 h-5 text-ink" aria-hidden="true">auto_awesome</span>
            </div>
            <div class="text-sm leading-snug text-[#343434]">Generate preview</div>
          </li>

          <li class="flex items-start gap-3">
            <div class="inline-flex items-center gap-2 rounded-full px-3.5 py-2 bg-sun border border-black/5 shadow-[0_6px_20px_-6px_rgba(0,0,0,.25)]">
              <span class="text-sm font-semibold text-ink/90">4</span>
              <span class="material-symbols-rounded w-5 h-5 text-ink" aria-hidden="true">download</span>
            </div>
            <div class="text-sm leading-snug text-[#343434]">Export PNG · CSV · PDF</div>
          </li>
        </ol>
      </div>

      <!-- CTA row -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <ButtonPrimary as="NuxtLink" to="/how-it-works" aria-label="See Full Guide" variant="pink">
          See Full Guide
          <span aria-hidden>→</span>
        </ButtonPrimary>

        <!-- Optional secondary nudge -->
        <ButtonOutline as="NuxtLink" to="/mosaic" variant="pink">
          Try Photo to Bricks
        </ButtonOutline>
      </div>
      </div>
    </section>
  </Transition>
</template>
