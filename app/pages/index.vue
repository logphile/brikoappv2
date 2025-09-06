<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import HeroSection from '~/components/HeroSection.vue'
import FeatureList from '~/components/FeatureList.vue'
import BottomBeforeAfter from '~/components/BottomBeforeAfter.vue'

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
    // Preload LCP image for faster discovery
    { rel: 'preload', as: 'image', href: '/demo-mosaic.png' }
  ]
})

// Fallback demo image handler
const onDemoImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = '/og-default.png'
}

// Image path as a simple string (served from /public). Using a const avoids Vite asset import rewriting.
const demoImg = '/demo-mosaic.png'

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
  <div class="bg-[#0B1220]">
    <HeroSection />
    <FeatureList />

    <main class="px-6 py-16 max-w-6xl mx-auto">
      <!-- Quick Demo -->
      <section class="mt-4 grid md:grid-cols-2 gap-8 items-center">
        <img
          :src="demoImg"
          @error="onDemoImgError"
          alt="Mosaic preview demo"
          class="rounded-2xl shadow"
          width="400"
          height="212"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <ul class="space-y-3 text-base md:text-lg">
          <li>• Instant LEGO-style color mapping</li>
          <li>• Greedy tiling → fewer plates, cleaner look</li>
          <li>• Bill of Materials + cost estimate</li>
          <li>• PNG / CSV / PDF exports</li>
        </ul>
      </section>

      <!-- How It Works teaser -->
      <section class="mt-16 rounded-2xl border border-white/10 p-6 md:p-8 text-center">
        <h2 class="text-2xl md:text-3xl font-bold">How it works</h2>
        <p class="mt-2 opacity-80">1) Upload  2) Pick size & palette  3) Generate  4) Export</p>
        <NuxtLink to="/how-it-works" class="inline-block mt-5 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15">See Full Guide</NuxtLink>
      </section>

      <p class="mt-8 text-xs opacity-60">Briko is an independent tool and is not affiliated with, endorsed by, or associated with the LEGO® Group.</p>
    </main>

    <BottomBeforeAfter />
  </div>
</template>

<style scoped>
</style>
