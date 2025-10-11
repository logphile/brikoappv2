<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import Compare from '~/components/ui/Compare.vue'
import IconCloudUpload from '~/components/icons/IconCloudUpload.vue'
import IconGridOn from '~/components/icons/IconGridOn.vue'
import IconRequestQuote from '~/components/icons/IconRequestQuote.vue'
import IconBolt from '~/components/icons/IconBolt.vue'
import IconGridView from '~/components/icons/IconGridView.vue'
import IconReceiptLong from '~/components/icons/IconReceiptLong.vue'
import IconFileDownload from '~/components/icons/IconFileDownload.vue'
import HowItWorks from '~/components/home/HowItWorks.vue'

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

// How it works: plain text labels (no numbers/icons)
const steps = [
  'Upload a photo',
  'Pick size & palette',
  'Generate preview',
  'Export PNG · CSV · PDF'
]

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
      <div class="mx-auto max-w-7xl px-6 lg:px-10 pt-24 pb-12 md:pt-28">
        <div class="grid lg:grid-cols-2 gap-10 items-center">

          <!-- LEFT: headline + bullets + CTA -->
          <div>
            <!-- Hero headline (semantic class) -->
            <h1 class="h1-hero max-w-[16ch]">
              <span class="hidden lg:block">Create</span>
              <span class="lg:hidden">Create </span>LEGO-style art from your images
            </h1>

            <!-- Bullets with local SVG components (no network) -->
            <ul class="mt-6 space-y-3">
              <li class="flex items-center gap-3 bullet-lg">
                <IconCloudUpload class="w-5 h-5 text-brand-pink" aria-hidden="true" />
                <span>Upload your photo</span>
              </li>
              <li class="flex items-center gap-3 bullet-lg">
                <IconGridOn class="w-5 h-5 text-brand-pink" aria-hidden="true" />
                <span>Instantly see it in bricks</span>
              </li>
              <li class="flex items-center gap-3 bullet-lg">
                <IconRequestQuote class="w-5 h-5 text-brand-pink" aria-hidden="true" />
                <span>Get the parts, guide, and price</span>
              </li>
            </ul>

            <!-- CTA -->
            <div class="mt-4 flex items-center gap-3">
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
        <div class="section-stack">
          <h2 class="h2-section">Briko’s Geeky Superpowers</h2>
          <p class="subtitle">The tech that makes bricks feel instant.</p>
          <div class="section-underline section-gap"></div>
        </div>

        <div class="section-gap">
          <FeatureList />
        </div>
      </div>
    </section>

    <!-- Purple band (never white) -->
    <section class="section-purple">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div class="section-stack">
          <h2 class="h2-section text-brand-paper">From Photo to Parts—Fast</h2>
          <p class="subtitle text-brand-paper/90">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <div class="section-underline section-gap"></div>
        </div>

        <!-- body: compare + bullet list -->
        <div class="section-gap grid grid-cols-1 lg:grid-cols-[720px,1fr] gap-10 items-center">
          <div class="max-w-[720px]">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" ratio="3/2" :start="45" />
          </div>

          <!-- Icon rows (no borders) with local SVG components -->
          <ul class="space-y-5 text-[#F5F4F1]">
            <li class="flex items-start gap-3 bullet-lg">
              <IconBolt class="mt-0.5 w-5 h-5 text-[#FFD808]" aria-hidden="true" />
              <span class="tracking-[0.1px] leading-tight">Instant LEGO–style color mapping</span>
            </li>
            <li class="flex items-start gap-3 bullet-lg">
              <IconGridView class="mt-0.5 w-5 h-5 text-[#FFD808]" aria-hidden="true" />
              <span class="tracking-[0.1px] leading-tight">Greedy tiling — fewer plates, cleaner look</span>
            </li>
            <li class="flex items-start gap-3 bullet-lg">
              <IconReceiptLong class="mt-0.5 w-5 h-5 text-[#FFD808]" aria-hidden="true" />
              <span class="tracking-[0.1px] leading-tight">Auto Bill of Materials • cost estimate</span>
            </li>
            <li class="flex items-start gap-3 bullet-lg">
              <IconFileDownload class="mt-0.5 w-5 h-5 text-[#FFD808]" aria-hidden="true" />
              <span class="tracking-[0.1px] leading-tight">One-click export: PNG · CSV · PDF</span>
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

        <div>
          <HowItWorks />

          <!-- 3) CTA row -->
          <div class="mt-5 flex items-center justify-center gap-3">
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
