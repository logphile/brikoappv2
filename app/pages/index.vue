<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import Compare from '~/components/ui/Compare.vue'
import FeaturePoints from '@/components/home/FeaturePoints.vue'
import IconUpload from '@/components/icons/IconUpload.vue'
import IconTune from '@/components/icons/IconTune.vue'
import IconAuto from '@/components/icons/IconAuto.vue'

const siteUrl = 'https://briko.app'

const buildTag = new Date().toISOString()

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
    <section class="relative bg-brand-yellow">
      <div class="container mx-auto px-4 lg:px-6 py-20 md:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-[1fr,520px] gap-10 items-center">
        <!-- Left: copy -->
        <div class="relative z-10">
            <h1 class="h1-hero text-[#343434] max-w-[18ch] mb-6">
              Create LEGO-style art from your images
            </h1>

            <ul class="space-y-2 mb-6">
              <li v-for="h in heroItems" :key="h.label" class="flex items-center gap-3">
                <span class="inline-flex h-7 w-7 rounded-lg bg-[#FF0062] ring-1 ring-black/10 items-center justify-center">
                  <component :is="h.Icon" class="h-[18px] w-[18px] text-white" />
                </span>
                <span class="text-[#343434]">{{ h.label }}</span>
              </li>
            </ul>

            <div>
              <NuxtLink to="/mosaic" class="btn rounded-lg bg-[#FF0062] text-white ring-transparent hover:opacity-90">
                Try it →
              </NuxtLink>
            </div>
            <p class="sr-only" :data-build="buildTag">build: {{ buildTag.slice(0,10) }}</p>
        </div>

        <!-- Right: hero before/after slider -->
        <div class="flex justify-center lg:justify-end">
          <Compare left="/home-1-mosaic.png" right="/home-1-original.jpg" ratio="4/3" :start="50" />
        </div>
      </div>
    </section>

    <!-- “Briko’s Geeky Superpowers” -->
    <section class="bg-[#FFD808]">
      <div class="mx-auto max-w-7xl px-6 md:px-8 pt-0 pb-12 md:pb-16">
        <header class="text-center mb-8 md:mb-10">
          <h2 class="font-slab text-[28px] md:text-[32px] text-[#343434]">Briko’s Geeky Superpowers</h2>
          <p class="mt-2 text-[#343434]/75 text-[14px] md:text-[15px]">The tech that makes bricks feel instant.</p>
          <span class="mini-rule mini-rule--pink mx-auto mt-3"></span>
        </header>

        <FeatureList />
      </div>
    </section>

    <!-- Purple band: spacing + structured content -->
    <section class="bg-[#2F3061] text-white">
      <div class="container mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <!-- heading block: breathing room -->
        <div class="text-center mb-10">
          <h2 class="font-slab text-2xl md:text-3xl">From Photo to Parts—Fast</h2>
          <p class="text-white/80 mt-2">
            Color mapping, greedy tiling, BOM, and exports—done in under two seconds.
          </p>
          <span class="mt-3 inline-block h-1 w-16 rounded bg-[#FF0062]"></span>
        </div>

        <!-- content: image left, cards right -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div class="max-w-[720px]">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" ratio="4/3" :start="52" />
          </div>

          <!-- 2×2 feature cards -->
          <FeaturePoints />
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

        <div class="mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <template v-for="(label, i) in steps" :key="label">
            <!-- step chip -->
            <span
              class="inline-flex items-center rounded-lg border border-[#343434]/20 bg-[#343434]/5 px-4 py-2 text-sm md:text-base text-[#343434]/90 shadow-sm"
            >
              {{ label }}
            </span>

            <!-- chevron (skip after last) -->
            <span v-if="i < steps.length - 1" class="chev inline-flex h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </template>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <NuxtLink to="/mosaic" class="btn bg-[#FF0062] text-white hover:opacity-90">Try Photo to Bricks</NuxtLink>
          <NuxtLink to="/docs/build-guide" class="btn bg-transparent ring-1 ring-[#000]/15 text-[#343434] hover:bg-white/30">See Full Guide →</NuxtLink>
        </div>

        <div class="mt-10 flex justify-center">
          <div class="soft-card p-0 overflow-hidden rounded-2xl w-full max-w-5xl border-white/10 bg-white/5">
            <Compare left="/home-3-mosaic.png" right="/home-3-original.jpg" ratio="4/3" :start="50" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
