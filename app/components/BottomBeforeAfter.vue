<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import HeroDemo from '~/components/HeroDemo.client.vue'

const inView = ref(false)
const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => { if (entry.isIntersecting) inView.value = true }, { threshold: 0.15 })
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
      <div class="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <h2 class="text-center text-2xl sm:text-3xl font-bold mb-6">See the Magic in Action</h2>

      <ClientOnly>
        <div class="relative mx-auto w-full rounded-2xl border border-white/10 bg-white/5 p-3 shadow-soft-card transition hover:-translate-y-0.5 hover:shadow-mint-glow/30">
          <div class="rounded-xl overflow-hidden h-[420px] md:h-[560px]">
            <HeroDemo :original-src="'/briko-alley.jpg?v=1'" :mosaic-src="'/briko-alley-2.jpg?v=1'" :fixed-height="true" />
          </div>
        </div>
        <template #fallback>
          <div class="mx-auto h-[420px] md:h-[560px] max-w-6xl rounded-2xl border border-white/10 bg-white/5" />
        </template>
      </ClientOnly>

      <p class="mt-4 text-center text-sm text-gray-400">
        Drag the line to compare — original vs Briko mosaic (made in seconds).
      </p>
      </div>
    </section>
  </Transition>
</template>
