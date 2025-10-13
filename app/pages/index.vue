<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import Compare from '~/components/ui/Compare.vue'
import FeatureGrid from '@/components/home/FeatureGrid.vue'
import HeroBg from '@/components/home/HeroBg.vue'
import IconUpload from '@/components/icons/IconUpload.vue'
import IconTune from '@/components/icons/IconTune.vue'
import IconAuto from '@/components/icons/IconAuto.vue'

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

const heroItems = [
  { label: 'Upload your photo', Icon: IconUpload },
  { label: 'Instantly see it in bricks', Icon: IconTune },
  { label: 'Get the parts, guide, and price', Icon: IconAuto }
]

// How it works: plain text labels (no numbers/icons)
const steps = [
  'Upload a photo',
  'Pick size & palette',
  'Generate preview',
  'Export PNG · CSV · PDF'
]

// Feature cards for Purple band
const features = [
  { title: 'Instant LEGO-style color mapping', blurb: 'Automatic brick-color remap for any photo.' },
  { title: 'Greedy tiling', blurb: 'Fewer plates, cleaner joins, faster build.' },
  { title: 'Auto Bill of Materials', blurb: 'Brick count and cost estimate in one click.' },
  { title: 'One-click export', blurb: 'PNG · CSV · PDF build guide.' },
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
    <section class="relative isolate">
      <HeroBg />
      <div class="relative z-10 mx-auto max-w-7xl px-6 md:px-8 pt-32 md:pt-48 pb-2.5">
        <div class="grid md:grid-cols-[1.05fr,1fr] items-start gap-y-10 gap-x-8 lg:gap-x-12">
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

          <!-- Right: feature grid cards -->
          <FeatureGrid class="mt-4 md:mt-0 lg:pl-6" />
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
      <div class="mx-auto max-w-7xl px-6 md:px-8">
        <header class="text-center mb-6">
          <h2 class="font-slab text-[24px] md:text-[28px] text-white">From Photo to Parts—Fast</h2>
          <p class="mt-2 text-white/75 text-[14px] md:text-[15px]">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
          <!-- LEFT: image -->
          <div class="relative rounded-2xl overflow-hidden shadow-lg max-h-[420px]">
            <img src="/home-1-mosaic.png" alt="" class="w-full h-auto object-cover" />
          </div>

          <!-- RIGHT: feature grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div v-for="(f,i) in features" :key="i"
                 class="rounded-2xl bg-[#343434]/60 border border-[#343434]/25 p-4 transition hover:border-[#00E5A0]/40 hover:ring-1 hover:ring-[#00E5A0]/25">
              <div class="flex items-start gap-3">
                <span class="mt-1 inline-block h-2 w-2 rounded-full" style="background-color:#00E5A0"></span>
                <div>
                  <h4 class="font-slab text-purple-200 text-base leading-tight">{{ f.title }}</h4>
                  <p class="text-white/70 text-sm mt-1">{{ f.blurb }}</p>
                </div>
              </div>
            </div>
          </div>
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
