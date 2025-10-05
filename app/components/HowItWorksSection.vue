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
      <!-- Custom Header (navy title, dark subhead, pink rule under subhead) -->
      <div class="text-center mb-8 md:mb-10">
        <h2 class="font-extrabold tracking-tight text-[#343434] leading-[1.1] text-[46px]">
          How it works
        </h2>
        <p class="mt-2 text-[#2F3061] leading-snug text-[1.125rem]">
          Four quick steps from photo to bricks.
        </p>
        <span class="block mx-auto mt-3 h-[3px] w-16 rounded-full bg-pink"></span>
      </div>

      <!-- Steps: navy cards; vertical on mobile, horizontal row with arrows on md+ -->
      <ul class="mt-6 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
        <!-- Step 1 -->
        <li class="flex items-center gap-3 px-6 py-4 bg-[#2F3061] text-white rounded-2xl border border-white/10 shadow-[0_14px_40px_-18px_rgba(52,52,52,0.25)]">
          <span class="material-symbols-rounded text-white text-[20px]" aria-hidden="true">photo_camera</span>
          <div class="font-medium"><span class="font-bold mr-1">1.</span> Upload a photo</div>
        </li>
        <li aria-hidden="true" class="hidden md:flex items-center px-3">
          <span class="material-symbols-rounded text-[32px] text-[#343434] opacity-80 hover:opacity-100 transition" aria-hidden="true">chevron_right</span>
        </li>

        <!-- Step 2 -->
        <li class="flex items-center gap-3 px-6 py-4 bg-[#2F3061] text-white rounded-2xl border border-white/10 shadow-[0_14px_40px_-18px_rgba(52,52,52,0.25)]">
          <span class="material-symbols-rounded text-white text-[20px]" aria-hidden="true">palette</span>
          <div class="font-medium"><span class="font-bold mr-1">2.</span> Pick size &amp; palette</div>
        </li>
        <li aria-hidden="true" class="hidden md:flex items-center px-3">
          <span class="material-symbols-rounded text-[32px] text-[#343434] opacity-80 hover:opacity-100 transition" aria-hidden="true">chevron_right</span>
        </li>

        <!-- Step 3 -->
        <li class="flex items-center gap-3 px-6 py-4 bg-[#2F3061] text-white rounded-2xl border border-white/10 shadow-[0_14px_40px_-18px_rgba(52,52,52,0.25)]">
          <span class="material-symbols-rounded text-white text-[20px]" aria-hidden="true">visibility</span>
          <div class="font-medium"><span class="font-bold mr-1">3.</span> Generate preview</div>
        </li>
        <li aria-hidden="true" class="hidden md:flex items-center px-3">
          <span class="material-symbols-rounded text-[32px] text-[#343434] opacity-80 hover:opacity-100 transition" aria-hidden="true">chevron_right</span>
        </li>

        <!-- Step 4 -->
        <li class="flex items-center gap-3 px-6 py-4 bg-[#2F3061] text-white rounded-2xl border border-white/10 shadow-[0_14px_40px_-18px_rgba(52,52,52,0.25)]">
          <span class="material-symbols-rounded text-white text-[20px]" aria-hidden="true">download</span>
          <div class="font-medium"><span class="font-bold mr-1">4.</span> Export PNG · CSV · PDF</div>
        </li>
      </ul>

      <!-- CTA row -->
      <div class="mt-10 flex items-center gap-4 justify-center">
        <!-- Primary: solid pink with white text -->
        <NuxtLink
          to="/mosaic"
          class="inline-flex items-center rounded-2xl px-5 py-3 font-semibold text-white bg-[#FF0062]
                 transition hover:bg-[#E00559] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/60"
        >
          Try Photo to Bricks
        </NuxtLink>

        <!-- Secondary: outline pink as direct NuxtLink -->
        <NuxtLink
          to="/how-it-works"
          aria-label="See Full Guide"
          class="relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold
                 transition-all duration-200 will-change-transform
                 hover:translate-y-[-1px] active:translate-y-0
                 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none
                 text-pink border border-pink/60 bg-transparent
                 hover:bg-pink/10 hover:shadow-[0_10px_30px_-6px_rgba(255,0,98,0.35)]
                 focus-visible:ring-2 focus-visible:ring-pink/60 cursor-pointer"
        >
          See Full Guide →
        </NuxtLink>
      </div>
      </div>
    </section>
  </Transition>
</template>
