<script setup lang="ts">
import { useHead } from 'nuxt/app'
useHead({
  title: 'Pricing | Briko',
  meta: [
    { name: 'description', content: 'Start free with Briko’s mosaic builder. Upgrade for unlimited exports, avatars, and premium MOC packs.' },
    { property: 'og:title', content: 'Pricing | Briko' },
    { property: 'og:description', content: 'Start free; Premium upgrades coming soon.' }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-16">
    <h1 class="text-4xl font-extrabold">Pricing</h1>
    <p class="mt-2 opacity-75">Simple and fair. Free while we’re in beta.</p>

    <section class="mt-10 grid gap-6 md:grid-cols-2">
      <!-- Free Beta -->
      <div class="card p-6">
        <h2 class="text-2xl font-semibold">Free Beta</h2>
        <p class="opacity-80 mt-1">Unlimited (fair-use)</p>
        <ul class="mt-4 space-y-2 opacity-90 list-disc pl-5">
          <li>Mosaic & Avatar & Voxel previews</li>
          <li>Greedy tiler (2×N plates) & cost estimate</li>
          <li>Exports: PDF build guide, CSV BOM, PNG plan</li>
          <li>Save projects & share public links</li>
        </ul>
        <NuxtLink to="/mosaic" class="btn-primary mt-6 inline-block">Start for free</NuxtLink>
      </div>

      <!-- Premium (teaser) -->
      <div class="card p-6">
        <h2 class="text-2xl font-semibold">Premium <span class="text-sm opacity-70">(coming soon)</span></h2>
        <p class="opacity-80 mt-1">For power builders and poster-makers</p>
        <ul class="mt-4 space-y-2 opacity-90 list-disc pl-5">
          <li>Bigger builds (e.g., 512×512 mosaics)</li>
          <li>Advanced tiling strategies & part constraints</li>
          <li>High-res printable posters & ZIP bundles</li>
          <li>Priority rendering & early features</li>
        </ul>
        <p class="text-sm opacity-70 mt-4">Want early access? Email <a class="underline" href="mailto:support@briko.app">support@briko.app</a>.</p>
      </div>
    </section>

    <p class="mt-10 text-xs opacity-70">
      Notes: We do not sell bricks; prices shown are rough estimates based on common parts/colors.
      Briko is not affiliated with the LEGO Group.
    </p>
  </main>
</template>

<style scoped>
.btn-primary{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white shadow; }
.card{ @apply rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10; }
</style>
