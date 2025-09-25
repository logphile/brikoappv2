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
    <section class="bg-transparent text-[#343434]">
      <div class="mx-auto max-w-6xl px-6 pt-8 sm:pt-12 pb-14 sm:pb-16">
      <SectionHeader
        title="See the Magic in Action"
        subtitle="Slide to watch pixels turn into plates."
        align="center"
        class="mb-8 md:mb-10"
      />

      <ClientOnly>
        <div class="relative mx-auto w-full framed-img bg-white/5 p-3 transition hover:-translate-y-0.5 hover:shadow-mint-glow/30">
          <div class="rounded-xl overflow-hidden h-[420px] md:h-[560px]">
            <HeroDemo :original-src="'/briko-alley.jpg?v=1'" :mosaic-src="'/briko-alley-2.jpg?v=1'" :fixed-height="true" />
          </div>
        </div>
        <template #fallback>
          <div class="mx-auto h-[420px] md:h-[560px] max-w-6xl rounded-2xl border border-white/10 bg-white/5" />
        </template>
      </ClientOnly>

      <p class="mt-4 text-sm text-pink-500 text-center">
        Drag the line to compare — original vs Briko mosaic (made in seconds).
      </p>
      </div>
    </section>
  </Transition>
</template>
