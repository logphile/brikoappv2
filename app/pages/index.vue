<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import Compare from '~/components/ui/Compare.vue'

const siteUrl = 'https://briko.app'

useHead({
  title: 'Turn Any Idea Into a Brick Build',
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
    { rel: 'canonical', href: 'https://briko.app/' },
    // Preload LCP image for faster discovery (absolute public URLs)
    { rel: 'preload', as: 'image', href: '/home-1-mosaic.png?v=20251004f' },
    { rel: 'preload', as: 'image', href: '/home-1-original.jpg?v=20251004f' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const homeWebPage = webPageJsonLd(
  siteUrl,
  '/',
  'Turn Any Idea Into a Brick Build',
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
  <div>
    <!-- HERO -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 pt-16 lg:pt-24 pb-12 lg:pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-[520px,1fr] gap-10 lg:gap-12 items-center">

          <!-- LEFT: headline + bullets + CTA -->
          <div>
            <!-- Shrink ~15% across breakpoints -->
            <h1 class="text-[45px] md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Create LEGO-style art from your images
            </h1>

            <!-- Bullets w/ Material Symbols -->
            <ul class="mt-6 space-y-2 text-lg">
              <li class="flex items-center gap-3">
                <span class="ms w-5 h-5 text-brand-pink">cloud_upload</span>
                <span>Upload your photo</span>
              </li>
              <li class="flex items-center gap-3">
                <span class="ms w-5 h-5 text-brand-pink">grid_on</span>
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-center gap-3">
                <span class="ms w-5 h-5 text-brand-pink">request_quote</span>
                <span>Get the parts, guide, and price</span>
              </li>
            </ul>

            <!-- CTA: remove “See Full Guide”; keep main button; keep larger top gap -->
            <div class="mt-16 flex items-center gap-3">
              <NuxtLink to="/photo" class="btn">Try Photo to Bricks</NuxtLink>
            </div>
          </div>

          <!-- RIGHT: compare slider (unchanged) -->
          <div class="max-w-[720px] justify-self-end w-full">
            <Compare left="/home-1-mosaic.png" right="/home-1-original.jpg" ratio="3/2" :start="55" />
          </div>
        </div>
      </div>
    </section>

    <!-- “Geeky Superpowers” stays in yellow -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <FeatureList />
      </div>
    </section>

    <!-- Purple band (never white) -->
    <section class="section-purple">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <h2 class="text-3xl md:text-4xl font-extrabold">From Photo to Parts—Fast</h2>
        <p class="mt-2 text-brand-ivory/80">Color mapping, greedy tiling, BOM, and exports—done in under two seconds.</p>

        <div class="mt-10 grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-10 items-center">
          <div class="max-w-[540px]">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" :start="48" />
          </div>
          <div class="space-y-4">
            <div class="seg seg-off ring-1 ring-brand-yellow/40 rounded-xl px-5 py-3">Instant LEGO-style color mapping</div>
            <div class="seg seg-off ring-1 ring-brand-yellow/40 rounded-xl px-5 py-3">Greedy tiling — fewer plates, cleaner look</div>
            <div class="seg seg-off ring-1 ring-brand-yellow/40 rounded-xl px-5 py-3">Auto Bill of Materials • cost estimate</div>
            <div class="seg seg-off ring-1 ring-brand-yellow/40 rounded-xl px-5 py-3">One-click export: PNG · CSV · PDF</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom compare -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div class="max-w-4xl">
          <Compare left="/home-3-mosaic.png" right="/home-3-original.jpg" :start="52" />
        </div>
      </div>
    </section>

    <!-- How it works (custom) -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-4">
        <h3 class="mt-20 text-3xl md:text-4xl font-extrabold text-center">How it works</h3>
        <p class="mt-1 text-center text-brand-dark/70">Four quick steps from photo to bricks.</p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <div class="step-pill">1. Upload a photo</div>
          <div class="step-pill">2. Pick size &amp; palette</div>
          <div class="step-pill">3. Generate preview</div>
          <div class="step-pill">4. Export PNG · CSV · PDF</div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <NuxtLink to="/photo" class="btn">Try Photo to Bricks</NuxtLink>
          <NuxtLink to="/how-it-works" class="btn-ghost">See Full Guide →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
