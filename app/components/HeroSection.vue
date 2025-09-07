<script setup lang="ts">
// No props needed yet
// Bind image sources via runtime strings to prevent Vite from transforming into static imports during build
const originalImg = '/demo-original.jpg'
const mosaicImg = '/demo-mosaic.jpg'
</script>

<template>
  <Transition
    appear
    enter-active-class="transition ease-out duration-700"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
  >
    <section class="relative overflow-hidden bg-[#0B1220] text-white">
      <div class="mx-auto max-w-7xl px-6 py-16 sm:py-20 text-center">
      <!-- Brand compact header (optional if already in layout) -->
      <!-- Headline -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
        Turn any picture into a brick build<span class="text-[#00E5A0]">!</span>
      </h1>

      <!-- Subtext -->
      <p
        class="mt-4 text-lg sm:text-xl text-gray-300 mx-auto text-center
               lg:whitespace-nowrap lg:max-w-none"
      >
        Upload your favorite photo
        <span class="mx-1 text-[#00E5A0]">→</span>
        see it transformed into a LEGO-style mosaic or 3D model
        <span class="mx-1 text-[#00E5A0]">→</span>
        download parts &amp; cost in seconds.
      </p>

      <!-- CTAs -->
      <div class="mt-6 flex flex-wrap items-center gap-4 justify-center">
        <!-- Primary: Photo to Bricks -->
        <NuxtLink
          to="/mosaic"
          class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold
                 shadow-sm ring-1 ring-transparent transition
                 bg-[#00E5A0] text-[#111827] hover:opacity-90 focus:outline-none focus-visible:ring-[#00E5A0]/40"
          aria-label="Try Photo to Bricks"
        >
          Photo to Bricks
        </NuxtLink>

        <!-- Secondary: See How It Works -->
        <NuxtLink
          to="/how-it-works"
          class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold
                 transition border border-[#00E5A0] text-[#00E5A0] hover:bg-[#00E5A0]/10"
          aria-label="See how Briko works"
        >
          See How It Works
        </NuxtLink>
      </div>

      <!-- Visual divider -->
      <div class="h-px w-24 bg-[#00E5A0] mx-auto my-10"></div>

      <!-- Demo: replace purple gradient with a simple before/after -->
      <div class="mt-12 grid gap-6 md:grid-cols-2 mx-auto max-w-4xl md:max-w-5xl justify-center">
        <!-- Original -->
        <figure class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            :src="originalImg"
            @error="(e) => ((e.target as HTMLImageElement).src = '/og-default.png')"
            alt="Original photo uploaded to Briko"
            class="w-full h-64 md:h-72 object-cover"
          />
          <figcaption class="px-4 py-3 text-sm text-gray-300">Original photo</figcaption>
        </figure>

        <!-- Mosaic Result -->
        <figure class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            :src="mosaicImg"
            @error="(e) => ((e.target as HTMLImageElement).src = '/demo-mosaic.png')"
            alt="Photo transformed into a LEGO-style mosaic"
            class="w-full h-64 md:h-72 object-cover"
          />
          <figcaption class="px-4 py-3 text-sm text-gray-300">
            LEGO-style mosaic preview — <span class="text-[#00E5A0]">made in seconds</span>
          </figcaption>
        </figure>
      </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
/* If you don't have icon fonts, remove i-lucide-* spans above and keep the labels only. */
</style>
