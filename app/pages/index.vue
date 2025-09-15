<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import HeroSection from '~/components/HeroSection.vue'
import FeatureList from '~/components/FeatureList.vue'
import FeatureBites from '~/components/FeatureBites.vue'
import BottomBeforeAfter from '~/components/BottomBeforeAfter.vue'
import HowItWorksSection from '~/components/HowItWorksSection.vue'

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
    { rel: 'preload', as: 'image', href: '/briko-champloo-2.jpg?v=1' },
    { rel: 'preload', as: 'image', href: '/briko-champloo.jpg?v=1' }
  ]
})

// VueCompareImage is globally registered by plugins/vue-compare-image.client.ts

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

    <main class="px-6 pt-16 pb-0 max-w-6xl mx-auto">
      <!-- Quick Demo: interactive before/after slider -->
      <section class="mt-12 sm:mt-16 grid md:grid-cols-2 gap-8">
        <div class="rounded-2xl overflow-hidden h-[340px] md:h-[420px]">
          <HeroDemo :original-src="'/briko-champloo.jpg?v=1'" :mosaic-src="'/briko-champloo-2.jpg?v=1'" :fixed-height="true" />
        </div>
        <div class="my-auto">
          <FeatureBites />
        </div>
      </section>

      <!-- How It Works -->
      <section class="mt-12 sm:mt-16">
        <HowItWorksSection />
      </section>
    </main>

    <section class="mt-12 sm:mt-16">
      <BottomBeforeAfter />
    </section>
  </div>
</template>

<style scoped>
</style>
