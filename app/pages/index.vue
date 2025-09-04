<script setup lang="ts">
import { useHead } from 'nuxt/app'
import heroUrl from '@/assets/banner.svg?url'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

// Optional: swap this string for an import from '@/utils/disclaimer'
const DISCLAIMER_TEXT =
  'Briko is not affiliated with the LEGO Group. Prices are rough estimates; availability and costs vary by supplier and color.'

// Use asset URL import to avoid absolute-path import resolution issues in SSR/Nitro build
const heroImg = heroUrl

const siteUrl = 'https://briko.app'

useHead({
  title: 'Briko | Turn Any Idea Into a Brick Build',
  meta: [
    { name: 'description', content: 'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.' },
    { property: 'og:title', content: 'Briko | Turn Any Idea Into a Brick Build' },
    { property: 'og:description', content: 'Image → Mosaic/Voxel → BOM + price → PDF/CSV/PNG.' },
    { property: 'og:url', content: 'https://briko.app/' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Briko | Turn Any Idea Into a Brick Build' },
    { name: 'twitter:description', content: 'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const homeWebPage = webPageJsonLd(
  siteUrl,
  '/',
  'Briko | Turn Any Idea Into a Brick Build',
  'Create LEGO-style mosaics and voxel builds in seconds. Upload any image, preview instantly, and export a parts list with Briko.'
)
const homeBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(homeWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(homeBreadcrumbs) }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-16">
    <!-- Hero -->
    <section class="grid gap-8 md:grid-cols-2 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight">
          Turn any idea into a <span class="underline decoration-pink-500/60">brick build</span>
        </h1>
        <p class="mt-4 text-lg opacity-80">
          Upload a photo or logo and get an instant LEGO-style mosaic or 3D voxel preview,
          complete with parts list, rough price, and exportable build steps.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink to="/mosaic" class="btn-primary">Try Mosaic</NuxtLink>
          <NuxtLink to="/avatar" class="btn-secondary">Make an Avatar</NuxtLink>
          <NuxtLink to="/voxel" class="btn-ghost">3D Voxel</NuxtLink>
        </div>
        <p class="mt-4 text-sm opacity-70">Free beta • No signup required to preview • One-click exports</p>
      </div>
      <div class="relative">
        <div class="aspect-video rounded-2xl ring-1 ring-white/10 overflow-hidden shadow-xl">
          <!-- Placeholder hero preview canvas image -->
          <img :src="heroImg" alt="Briko preview example" class="w-full h-full object-cover" />
        </div>
      </div>
    </section>

    <!-- How it works (quick) -->
    <section class="mt-16 grid gap-6 md:grid-cols-3">
      <div class="card p-6">
        <div class="text-3xl">📤</div>
        <h3 class="font-semibold mt-2">1) Upload</h3>
        <p class="opacity-80">Drop an image or paste a URL. We auto-fit size and palette.</p>
      </div>
      <div class="card p-6">
        <div class="text-3xl">🧱</div>
        <h3 class="font-semibold mt-2">2) Preview</h3>
        <p class="opacity-80">See a mosaic or voxel preview instantly with plate/part counts.</p>
      </div>
      <div class="card p-6">
        <div class="text-3xl">📦</div>
        <h3 class="font-semibold mt-2">3) Export</h3>
        <p class="opacity-80">Download PDF build steps, CSV BOM, and PNG plan. Share a link.</p>
      </div>
    </section>

    <!-- Why Briko -->
    <section class="mt-16 grid gap-6 md:grid-cols-2">
      <div class="card p-6">
        <h3 class="font-semibold text-xl">Fast & free-tier focused</h3>
        <ul class="mt-3 space-y-2 opacity-80 list-disc pl-5">
          <li>Progressive previews; no blocking UI</li>
          <li>Greedy tiler for 2×N plates → fewer parts, lower rough cost</li>
          <li>Works in the browser — no installs</li>
        </ul>
      </div>
      <div class="card p-6">
        <h3 class="font-semibold text-xl">Exports you can use</h3>
        <ul class="mt-3 space-y-2 opacity-80 list-disc pl-5">
          <li>PDF build guide with per-step pages</li>
          <li>CSV BOM with estimated costs</li>
          <li>PNG plan and shareable project links</li>
        </ul>
      </div>
    </section>

    <p class="mt-12 text-xs opacity-70">{{ DISCLAIMER_TEXT }}</p>
  </main>
</template>

<style scoped>
.btn-primary{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white shadow; }
.btn-secondary{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white; }
.btn-ghost{ @apply inline-flex items-center rounded-xl px-4 py-2 bg-transparent hover:bg-white/5 ring-1 ring-white/10; }
.card{ @apply rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10; }
</style>
