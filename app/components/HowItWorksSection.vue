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
    <section class="bg-transparent text-[#343434]" aria-labelledby="how-it-works">
      <div class="mx-auto max-w-6xl px-6 pt-14 sm:pt-16 pb-0">
      <!-- Header -->
      <div class="text-center">
        <h2 id="how-it-works" class="sr-only">How it works</h2>
        <h2 class="h-section-46">How it works</h2>
        <p class="mt-2 text-[#343434]">Four quick steps from photo to bricks.</p>
        <div class="mx-auto mt-3 h-1 w-20 rounded-full bg-pink-500/80"></div>
      </div>

      <!-- Stepper -->
      <div class="relative mt-10">
        <!-- Faint flow line left→right (desktop) -->
        <div class="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>
        <ol
          class="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 z-10"
          aria-label="Four steps to create your brick build"
        >
        <!-- Step (repeatable pattern) -->
        <Transition
          appear
          enter-active-class="transition ease-out duration-700 delay-100"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <li class="group">
            <div class="soft-card relative rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-900 shadow-sm cursor-default select-none">
              <!-- number badge -->
              <div class="absolute -top-4 left-6 h-8 w-8 rounded-full bg-pink-500 text-white grid place-items-center text-sm font-bold ring-2 ring-white/50">1</div>

              <!-- icon tile -->
              <div class="mb-3 inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">file_upload</span>
              </div>

              <h3 class="text-lg font-extrabold text-gray-900">Upload</h3>
              <p class="mt-1 text-sm text-gray-800/75">Drop in a favorite photo — pets, people, or art.</p>
            </div>
          </li>
        </Transition>

        <Transition
          appear
          enter-active-class="transition ease-out duration-700 delay-300"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <li class="group">
            <div class="soft-card relative rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-900 shadow-sm cursor-default select-none">
              <div class="absolute -top-4 left-6 h-8 w-8 rounded-full bg-pink-500 text-white grid place-items-center text-sm font-bold ring-2 ring-white/50">2</div>
              <div class="mb-3 inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">palette</span>
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">Pick size &amp; palette</h3>
              <p class="mt-1 text-sm text-gray-800/75">Choose brick size and colors — we’ll map it for you.</p>
            </div>
          </li>
        </Transition>

        <Transition
          appear
          enter-active-class="transition ease-out duration-700 delay-500"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <li class="group">
            <div class="soft-card relative rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-900 shadow-sm cursor-default select-none">
              <div class="absolute -top-4 left-6 h-8 w-8 rounded-full bg-pink-500 text-white grid place-items-center text-sm font-bold ring-2 ring-white/50">3</div>
              <div class="mb-3 inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">auto_awesome</span>
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">Generate</h3>
              <p class="mt-1 text-sm text-gray-800/75">Preview the mosaic or 3D build in seconds.</p>
            </div>
          </li>
        </Transition>

        <Transition
          appear
          enter-active-class="transition ease-out duration-700 delay-700"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <li class="group">
            <div class="soft-card relative rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-900 shadow-sm cursor-default select-none">
              <div class="absolute -top-4 left-6 h-8 w-8 rounded-full bg-pink-500 text-white grid place-items-center text-sm font-bold ring-2 ring-white/50">4</div>
              <div class="mb-3 inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">download</span>
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">Export</h3>
              <p class="mt-1 text-sm text-gray-800/75">Get parts list, cost estimate, and build steps.</p>
            </div>
          </li>
        </Transition>
        </ol>
      </div>

      <!-- CTA row -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <ButtonPrimary as="NuxtLink" to="/how-it-works" aria-label="See Full Guide">
          See Full Guide
          <span aria-hidden>→</span>
        </ButtonPrimary>

        <!-- Optional secondary nudge -->
        <ButtonOutline as="NuxtLink" to="/mosaic">
          Try Photo to Bricks
        </ButtonOutline>
      </div>
      </div>
    </section>
  </Transition>
</template>
