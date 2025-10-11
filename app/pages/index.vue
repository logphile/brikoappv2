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

// Fast features for the purple section (Iconify rounded icons + text)
const fastFeatures = [
  { icon: 'material-symbols:bolt-rounded',           text: 'Instant LEGO–style color mapping' },
  { icon: 'material-symbols:grid-view-rounded',      text: 'Greedy tiling — fewer plates, cleaner look' },
  { icon: 'material-symbols:receipts-rounded',       text: 'Auto Bill of Materials • cost estimate' },
  { icon: 'material-symbols:file-download-rounded',  text: 'One-click export: PNG · CSV · PDF' }
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

            <!-- Bullets with Iconify SVGs (keep layout/image unchanged) -->
            <ul class="mt-6 space-y-3 text-[#343434]">
              <li class="flex items-center gap-3">
                <AppIcon name="material-symbols:cloud-upload-rounded" class="w-5 h-5 text-[#FF0062]" />
                <span>Upload your photo</span>
              </li>
              <li class="flex items-center gap-3">
                <AppIcon name="material-symbols:grid-on-rounded" class="w-5 h-5 text-[#FF0062]" />
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-center gap-3">
                <AppIcon name="material-symbols:request-quote-rounded" class="w-5 h-5 text-[#FF0062]" />
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
          <ul class="flex flex-col gap-3 text-[#F5F4F1]">
            <li v-for="f in fastFeatures" :key="f.text" class="flex items-start gap-3">
              <AppIcon :name="f.icon" class="mt-0.5 text-[#FFD808]" />
              <span class="tracking-[0.1px] leading-tight">{{ f.text }}</span>
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
