<script setup lang="ts">
import HeroDemo from '~/components/HeroDemo.client.vue'
</script>

<template>
  <section class="bg-[#0B1220] text-white">
    <div class="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <h2 class="text-center text-2xl sm:text-3xl font-bold mb-6">See the Magic in Action</h2>

      <ClientOnly>
        <div class="relative mx-auto w-full rounded-2xl border border-white/10 bg-white/5 p-3">
          <div class="rounded-xl overflow-hidden h-[420px] md:h-[560px]">
            <HeroDemo :original-src="'/lg-slider-original.jpg?v=1'" :mosaic-src="'/large-slider-mosaic.jpg?v=1'" :fixed-height="true" />
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
</template>
