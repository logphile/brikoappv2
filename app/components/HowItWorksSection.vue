<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

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
    <section class="bg-[#0B1220] text-white">
      <div class="mx-auto max-w-6xl px-6 pt-14 sm:pt-16 pb-0">
      <!-- Header -->
      <div class="text-center">
        <h2 class="h-section-52">
          How it works
        </h2>
        <p class="mt-2 text-gray-300">
          Four quick steps from photo to bricks.
        </p>
        <span class="mt-4 inline-block h-1 w-20 rounded bg-[#00E5A0]"></span>
      </div>

      <!-- Stepper -->
      <div class="relative mt-10">
        <!-- Faint flow line left→right (desktop) -->
        <div class="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>
        <ol
          class="relative grid gap-4 sm:gap-5 md:grid-cols-4 z-10"
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
            <div
              class="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-[#00E5A0]/[0.07]
                     p-5 h-full ring-1 ring-white/10 transition hover:ring-[#00E5A0]/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              <!-- Number badge -->
              <div class="absolute -top-3 left-5">
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5A0] text-[#111827] font-bold"
                >1</span>
              </div>

              <!-- Icon -->
              <div
                class="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl
                       bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25"
              >
                <!-- Upload icon -->
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 3v10l4-4 1 1-6 6-6-6 1-1 4 4V3h2Zm-7 15h14v2H5v-2Z"/>
                </svg>
              </div>

              <h3 class="mt-4 text-lg font-semibold">Upload</h3>
              <p class="mt-1 text-sm text-gray-300">
                Drop in a favorite photo — pets, people, or art.
              </p>

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
            <div
              class="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-[#00E5A0]/[0.07]
                     p-5 h-full ring-1 ring-white/10 transition hover:ring-[#00E5A0]/30 hover:shadow-lg"
            >
              <div class="absolute -top-3 left-5">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5A0] text-[#111827] font-bold">2</span>
              </div>
              <div class="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25">
                <!-- Palette icon -->
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 0-4h4a4 4 0 0 0 0-8h-1a3 3 0 0 1-3-3 5 5 0 0 0-0-5zM7 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-1 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5-1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-semibold">Pick size & palette</h3>
              <p class="mt-1 text-sm text-gray-300">Choose brick size and colors — we’ll map it for you.</p>
              <div class="hidden md:block absolute top-1/2 right-[-10px] h-[2px] w-5 bg-[#00E5A0]/40"></div>
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
            <div
              class="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-[#00E5A0]/[0.05]
                     p-5 h-full ring-1 ring-white/10 transition hover:ring-[#00E5A0]/30 hover:shadow-lg"
            >
              <div class="absolute -top-3 left-5">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5A0] text-[#111827] font-bold">3</span>
              </div>
              <div class="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25">
                <!-- Sparkles icon -->
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 9 9 2 12l7 3 3 7 3-7 7-3-7-3-3-7zM6 5l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2zM18 5l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2z"/>
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-semibold">Generate</h3>
              <p class="mt-1 text-sm text-gray-300">Preview the mosaic or 3D build in seconds.</p>
              <div class="hidden md:block absolute top-1/2 right-[-10px] h-[2px] w-5 bg-[#00E5A0]/40"></div>
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
            <div
              class="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-[#00E5A0]/[0.05]
                     p-5 h-full ring-1 ring-white/10 transition hover:ring-[#00E5A0]/30 hover:shadow-lg"
            >
              <div class="absolute -top-3 left-5">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5A0] text-[#111827] font-bold">4</span>
              </div>
              <div class="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5A0]/15 text-[#00E5A0] ring-1 ring-[#00E5A0]/25">
                <!-- Download icon -->
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 3v10l4-4 1 1-6 6-6-6 1-1 4 4V3h2Zm-7 15h14v2H5v-2Z"/>
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-semibold">Export</h3>
              <p class="mt-1 text-sm text-gray-300">Get parts list, cost estimate, and build steps.</p>
            </div>
          </li>
        </Transition>
        </ol>
      </div>

      <!-- CTA row -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <NuxtLink
          to="/how-it-works"
          class="inline-flex items-center gap-2 btn-mint"
          aria-label="See Full Guide"
        >
          See Full Guide
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M13 5l7 7-7 7-1.4-1.4L16.2 13H4v-2h12.2L11.6 6.4 13 5z"/>
          </svg>
        </NuxtLink>

        <!-- Optional secondary nudge -->
        <NuxtLink
          to="/mosaic"
          class="inline-flex items-center gap-2 btn-outline-mint"
        >
          Try Photo to Bricks
        </NuxtLink>
      </div>
      </div>
    </section>
  </Transition>
</template>
