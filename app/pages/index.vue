<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import Compare from '~/components/ui/Compare.vue'
import { HomeIcons, __ICONS_OK__ } from '@/lib/home-icons'

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

// Keep build-time icon imports alive so bad names fail at compile-time
void __ICONS_OK__

const heroItems = [
  { label: 'Upload your photo', Icon: HomeIcons.upload },
  { label: 'Instantly see it in bricks', Icon: HomeIcons.tune },
  { label: 'Get the parts, guide, and price', Icon: HomeIcons.auto }
]

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
    <section class="relative bg-[#FFD808]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 pt-16 md:pt-24">
        <div class="grid md:grid-cols-[1.05fr,1fr] items-center gap-10 md:gap-14">
          <!-- Left: copy -->
          <div>
            <h1 class="h1-hero text-[#343434] max-w-[18ch]">
              Create LEGO-style art from your images
            </h1>

            <ul class="mt-5 space-y-2">
              <li v-for="h in heroItems" :key="h.label" class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-7 w-7 rounded-lg bg-[#FF0062] ring-1 ring-black/10 items-center justify-center">
                  <component :is="h.Icon" class="h-[18px] w-[18px] text-white" />
                </span>
                <span class="text-[#343434]">{{ h.label }}</span>
              </li>
            </ul>

            <div class="mt-6">
              <NuxtLink to="/mosaic" class="btn bg-[#FF0062] text-white ring-transparent hover:opacity-90">
                Try Photo to Bricks
              </NuxtLink>
            </div>
          </div>

          <!-- Right: image card -->
          <div class="soft-card p-0 overflow-hidden rounded-2xl shadow-md">
            <Compare left="/home-1-mosaic.png" right="/home-1-original.jpg" ratio="3/2" :start="52" />
          </div>
        </div>
      </div>
    </section>

    <!-- “Briko’s Geeky Superpowers” -->
    <section class="bg-[#FFD808]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16">
        <header class="text-center mb-8 md:mb-10">
          <h2 class="font-slab text-[28px] md:text-[32px] text-[#343434]">Briko’s Geeky Superpowers</h2>
          <p class="mt-2 text-[#343434]/75 text-[14px] md:text-[15px]">The tech that makes bricks feel instant.</p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <FeatureList />
      </div>
    </section>

    <!-- Purple band -->
    <section class="bg-[#2F3061]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 py-16">
        <header class="text-center mb-6">
          <h2 class="font-slab text-[24px] md:text-[28px] text-white">From Photo to Parts—Fast</h2>
          <p class="mt-2 text-white/75 text-[14px] md:text-[15px]">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <div class="grid md:grid-cols-2 items-center gap-10">
          <div class="soft-card p-0 overflow-hidden rounded-2xl border-white/10 bg-white/5">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" ratio="3/2" :start="45" />
          </div>

          <ul class="space-y-3 text-white">
            <li class="pl-8 relative">
              <span class="absolute left-1 top-[0.5rem] inline-block w-[14px] h-[14px] rounded-full bg-[#FFD808]"></span>
              Instant LEGO-style color mapping
            </li>
            <li class="pl-8 relative">
              <span class="absolute left-1 top-[0.5rem] inline-block w-[14px] h-[14px] rounded-full bg-[#FFD808]"></span>
              Greedy tiling — fewer plates, cleaner look
            </li>
            <li class="pl-8 relative">
              <span class="absolute left-1 top-[0.5rem] inline-block w-[14px] h-[14px] rounded-full bg-[#FFD808]"></span>
              Auto Bill of Materials + cost estimate
            </li>
            <li class="pl-8 relative">
              <span class="absolute left-1 top-[0.5rem] inline-block w-[14px] h-[14px] rounded-full bg-[#FFD808]"></span>
              One-click export: PNG · CSV · PDF
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="bg-[#FFD808]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 py-16">
        <header class="text-center mb-8">
          <h2 class="font-slab text-[28px] md:text-[32px] text-[#343434]">How it works</h2>
          <p class="mt-1 text-[#343434]/75">Four quick steps from photo to bricks.</p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <span class="px-4 py-2 rounded-xl ring-1 ring-[#000]/10 bg-white/40 text-[#343434]">Upload a photo</span>
          <span class="px-4 py-2 rounded-xl ring-1 ring-[#000]/10 bg-white/40 text-[#343434]">Pick size &amp; palette</span>
          <span class="px-4 py-2 rounded-xl ring-1 ring-[#000]/10 bg-white/40 text-[#343434]">Generate preview</span>
          <span class="px-4 py-2 rounded-xl ring-1 ring-[#000]/10 bg-white/40 text-[#343434]">Export PNG · CSV · PDF</span>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <NuxtLink to="/mosaic" class="btn bg-[#FF0062] text-white hover:opacity-90">Try Photo to Bricks</NuxtLink>
          <NuxtLink to="/docs/build-guide" class="btn bg-transparent ring-1 ring-[#000]/15 text-[#343434] hover:bg-white/30">See Full Guide →</NuxtLink>
        </div>

        <div class="mt-10 flex justify-center">
          <div class="soft-card p-0 overflow-hidden rounded-2xl w-full max-w-5xl border-white/10 bg-white/5">
            <Compare left="/home-3-mosaic.png" right="/home-3-original.jpg" ratio="3/2" :start="52" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
