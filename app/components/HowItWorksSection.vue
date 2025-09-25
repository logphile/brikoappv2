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
        align="center"
        class="mb-8 md:mb-10"
      />

      <!-- Steps: simple list on mobile, 2x2 soft cards on md+ -->
      <ul class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Step 1 -->
        <li
          class="flex items-center gap-3 md:items-start md:p-4 md:bg-white/5 md:border md:border-white/10 md:rounded-2xl md:shadow-[0_14px_40px_-18px_rgba(0,0,0,.6)]"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun text-ink font-bold ring-1 ring-black/5 shadow-sm"
            aria-hidden="true"
          >1</span>
          <div class="text-ink font-semibold">Upload a photo</div>
        </li>

        <!-- Step 2 -->
        <li
          class="flex items-center gap-3 md:items-start md:p-4 md:bg-white/5 md:border md:border-white/10 md:rounded-2xl md:shadow-[0_14px_40px_-18px_rgba(0,0,0,.6)]"
        >
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun text-ink font-bold ring-1 ring-black/5 shadow-sm" aria-hidden="true">2</span>
          <div class="text-ink font-semibold">Pick size &amp; palette</div>
        </li>

        <!-- Step 3 -->
        <li
          class="flex items-center gap-3 md:items-start md:p-4 md:bg-white/5 md:border md:border-white/10 md:rounded-2xl md:shadow-[0_14px_40px_-18px_rgba(0,0,0,.6)]"
        >
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun text-ink font-bold ring-1 ring-black/5 shadow-sm" aria-hidden="true">3</span>
          <div class="text-ink font-semibold">Generate preview</div>
        </li>

        <!-- Step 4 -->
        <li
          class="flex items-center gap-3 md:items-start md:p-4 md:bg-white/5 md:border md:border-white/10 md:rounded-2xl md:shadow-[0_14px_40px_-18px_rgba(0,0,0,.6)]"
        >
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun text-ink font-bold ring-1 ring-black/5 shadow-sm" aria-hidden="true">4</span>
          <div class="text-ink font-semibold">Export PNG · CSV · PDF</div>
        </li>
      </ul>

      <!-- CTA row -->
      <div class="mt-6 flex items-center gap-4 justify-center md:justify-start">
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
