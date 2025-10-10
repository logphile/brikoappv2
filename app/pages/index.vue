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

// Fast features for the purple section (icon + text)
const fastFeatures = [
  { icon: 'bolt',          text: 'Instant LEGO–style color mapping' },
  { icon: 'grid_view',     text: 'Greedy tiling — fewer plates, cleaner look' },
  { icon: 'receipt_long',  text: 'Auto Bill of Materials • cost estimate' },
  { icon: 'file_download', text: 'One-click export: PNG · CSV · PDF' }
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 pt-24 pb-12 md:pt-28">
        <div class="grid lg:grid-cols-2 gap-10 items-center">

          <!-- LEFT: headline + bullets + CTA -->
          <div>
            <!-- Hero headline (larger + controlled line length) -->
            <h1 class="hero-h1 max-w-[16ch]">
              <span class="hidden lg:block">Create</span>
              <span class="lg:hidden">Create </span>LEGO-style art from your images
            </h1>

            <!-- Bullets with inline SVG (no external deps) -->
            <ul class="mt-6 space-y-2 text-base md:text-lg">
              <li class="flex items-center gap-3">
                <!-- camera -->
                <svg class="w-4 h-4 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 3a1 1 0 0 0-.894.553L7.382 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.382l-.724-1.447A1 1 0 0 0 13 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                </svg>
                <span>Upload your photo</span>
              </li>
              <li class="flex items-center gap-3">
                <!-- grid -->
                <svg class="w-4 h-4 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                </svg>
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-center gap-3">
                <!-- quote/price -->
                <svg class="w-4 h-4 text-brand-pink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm12 0v4h4l-4-4zM7 12h10v2H7v-2zm0 4h6v2H7v-2z"/>
                </svg>
                <span>Get the parts, guide, and price</span>
              </li>
            </ul>

            <!-- CTA -->
            <div class="mt-6 flex items-center gap-3">
              <NuxtLink to="/photo" class="btn">Try Photo to Bricks</NuxtLink>
            </div>
          </div>

          <!-- RIGHT: compare slider (unchanged) -->
          <div class="max-w-[720px] justify-self-end w-full">
            <Compare left="/home-1-mosaic.png" right="/home-1-original.jpg" ratio="3/2" :start="52" />
          </div>
        </div>
      </div>
    </section>

    <!-- “Briko’s Geeky Superpowers” -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div class="section-title">
          <h2 class="font-slab text-3xl md:text-4xl font-extrabold">
            Briko’s Geeky Superpowers
          </h2>
          <p class="mt-2 text-brand-dark/70">
            The tech that makes bricks feel instant.
          </p>
          <div class="rule"></div>
        </div>

        <div class="section-gap">
          <FeatureList />
        </div>
      </div>
    </section>

    <!-- Purple band (never white) -->
    <section class="section-purple">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div class="section-title text-brand-yellow">
          <h2 class="font-slab text-3xl md:text-4xl font-extrabold">
            From Photo to Parts—Fast
          </h2>
          <p class="mt-2 text-brand-yellow/80">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <div class="rule"></div>
        </div>

        <!-- body: compare + bullet list -->
        <div class="section-gap grid grid-cols-1 lg:grid-cols-[720px,1fr] gap-10 items-center">
          <div class="max-w-[720px]">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" ratio="3/2" :start="45" />
          </div>

          <!-- Icon rows (no borders) -->
          <ul class="mx-auto w-full max-w-[720px] space-y-3">
            <li
              v-for="f in fastFeatures"
              :key="f.text"
              class="flex items-center gap-3 rounded-xl px-4 py-3 text-[17px] leading-tight text-[#FFD808] hover:bg-white/5 transition"
            >
              <span class="material-symbols-outlined text-[22px]" aria-hidden="true">{{ f.icon }}</span>
              <span class="tracking-[0.1px]">{{ f.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-12">

        <div class="section-title">
          <h2 class="font-slab text-3xl md:text-4xl font-extrabold">How it works</h2>
          <p class="mt-2 text-brand-dark/70">Four quick steps from photo to bricks.</p>
          <div class="rule"></div>
        </div>

        <div class="section-gap">
          <!-- 2) Dark chips + chevrons (centered row) -->
          <div class="flex flex-wrap items-center justify-center gap-3">
            <div class="chip-dark"><span class="text-brand-ivory/90">📷</span><span class="font-semibold">1. Upload a photo</span></div>
            <span class="chip-chevron">›</span>
            <div class="chip-dark"><span class="text-brand-ivory/90">🎨</span><span class="font-semibold">2. Pick size &amp; palette</span></div>
            <span class="chip-chevron">›</span>
            <div class="chip-dark"><span class="text-brand-ivory/90">👁️</span><span class="font-semibold">3. Generate preview</span></div>
            <span class="chip-chevron">›</span>
            <div class="chip-dark"><span class="text-brand-ivory/90">⬇️</span><span class="font-semibold">4. Export PNG · CSV · PDF</span></div>
          </div>

          <!-- 3) CTA row -->
          <div class="mt-4 flex items-center justify-center gap-3">
            <NuxtLink to="/photo" class="btn">Try Photo to Bricks</NuxtLink>
            <NuxtLink to="/how-it-works" class="btn-ghost-alt">See Full Guide →</NuxtLink>
          </div>

          <!-- 4) Parrot compare sits BELOW the pills/CTAs -->
          <div class="mt-10 flex justify-center">
            <div class="w-full max-w-5xl">
              <Compare left="/home-3-mosaic.png" right="/home-3-original.jpg" ratio="3/2" :start="52" />
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
