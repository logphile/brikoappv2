<script setup lang="ts">
import { useHead } from '#imports'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const featuresFree = ['Mosaic builder','PNG / CSV exports','Basic voxel preview']
const featuresPro  = ['Unlimited exports','Avatar posters','Curated MOC packs','Save & share projects']

// SEO
useHead({
  title: 'Pricing',
  meta: [
    { name: 'description', content: 'Briko is free to start. Mosaic builder, exports, and a basic 3D preview are included. Pro is coming soon.' },
    { name: 'keywords', content: 'Briko pricing, LEGO mosaic generator pricing, voxel builder pricing, Briko app' },
    { property: 'og:title', content: 'Pricing | Briko' },
    { property: 'og:description', content: 'Briko is free to start. Mosaic builder, exports, and a basic 3D preview are included. Pro is coming soon.' },
    { property: 'og:url', content: 'https://briko.app/pricing' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Pricing | Briko' },
    { name: 'twitter:description', content: 'Briko is free to start. Mosaic builder, exports, and a basic 3D preview are included. Pro is coming soon.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/pricing' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const pricingWebPage = webPageJsonLd(
  siteUrl,
  '/pricing',
  'Pricing',
  'Briko is free to start. Mosaic builder, exports, and a basic 3D preview are included. Pro is coming soon.'
)
const pricingBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(pricingWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(pricingBreadcrumbs) }
  ]
})
</script>

<template>
  <header class="page-wrap mt-6">
    <h1 class="text-5xl lg:text-6xl font-display">Pricing</h1>
  </header>

  <main class="page-wrap mt-6 space-y-10">
    <!-- Plans -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Free -->
      <div class="card p-6">
        <h3 class="text-xl font-semibold">Free</h3>
        <p class="mt-1 text-4xl font-bold">$0</p>
        <ul class="mt-4 space-y-2 text-[#34343A]">
          <li v-for="f in featuresFree" :key="f">• {{ f }}</li>
        </ul>
        <NuxtLink to="/photo-to-bricks" class="btn-primary mt-6 inline-flex">Try Mosaic</NuxtLink>
      </div>

      <!-- Pro -->
      <div class="card p-6">
        <h3 class="text-xl font-semibold">Pro (coming soon)</h3>
        <ul class="mt-8 space-y-2 text-[#34343A]">
          <li v-for="f in featuresPro" :key="f">• {{ f }}</li>
        </ul>
        <NuxtLink to="/waitlist" class="btn-primary mt-6 inline-flex">Join Waitlist</NuxtLink>
      </div>
    </section>

    <!-- FAQ -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">FAQ</h2>

      <details class="card p-4">
        <summary class="cursor-pointer font-medium">Is Briko affiliated with LEGO®?</summary>
        <p class="mt-2 prose-briko">No. Briko is independent and not affiliated with, endorsed by, or associated with the LEGO Group.</p>
      </details>

      <details class="card p-4">
        <summary class="cursor-pointer font-medium">Will my projects be public?</summary>
        <p class="mt-2 prose-briko">Private by default. You can choose to publish a project to the Community Gallery.</p>
      </details>

      <details class="card p-4">
        <summary class="cursor-pointer font-medium">What’s the refund policy?</summary>
        <p class="mt-2 prose-briko">If we ever charge for Pro, we’ll offer a simple refund window—details will be listed here at launch.</p>
      </details>
    </section>
  </main>
</template>
