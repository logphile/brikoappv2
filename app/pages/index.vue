<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import FeatureList from '~/components/FeatureList.vue'
import HowItWorksSection from '~/components/HowItWorksSection.vue'
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
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-12 lg:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-[520px,1fr] gap-8 items-center">
          <!-- left: text -->
          <div>
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Create LEGO-style art from your images
            </h1>
            <ul class="mt-6 space-y-2 text-lg">
              <li>Upload your photo</li>
              <li>Instantly see it in bricks</li>
              <li>Get the parts, guide, and price</li>
            </ul>
          </div>
          <!-- right: compare slider -->
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
        <div class="grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-8 items-center">
          <div class="max-w-[540px]">
            <Compare left="/home-2-mosaic.png" right="/home-2-original.jpg" :start="48" />
          </div>
          <div class="space-y-4">
            <div class="seg seg-off">Instant LEGO-style color mapping</div>
            <div class="seg seg-off">Greedy tiling — fewer plates, cleaner look</div>
            <div class="seg seg-off">Auto Bill of Materials + cost estimate</div>
            <div class="seg seg-off">One-click export: PNG · CSV · PDF</div>
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

    <!-- How It Works stays -->
    <section class="section-yellow">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <HowItWorksSection />
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
