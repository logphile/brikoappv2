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
            <!-- +20% headline: was text-[44px] md:6xl lg:7xl -->
            <h1 class="text-[53px] md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight">
              Create LEGO-style art from your images
            </h1>

            <!-- Bullets w/ pink mini icons -->
            <ul class="mt-6 space-y-2 text-lg">
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 3l9 9-9 9M12 8v10" />
                </svg>
                <span>Upload your photo</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4 5h16v14H4zM8 9h2v2H8zM12 9h2v2h-2zM16 9h2v2h-2zM8 13h2v2H8zM12 13h2v2h-2zM16 13h2v2h-2z"/>
                </svg>
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4h10a2 2 0 0 1 2 2v12l-7-3-7 3V6a2 2 0 0 1 2-2z"/>
                </svg>
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
            <Compare left="/home-1-mosaic.png" right="/home-1-original.jpg" :start="55" />
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
