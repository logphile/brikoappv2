<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
useHead({
  title: 'Pricing',
  meta: [
    { name: 'description', content: 'Start free with Briko’s mosaic builder. Upgrade for unlimited exports, avatars, and premium MOC packs.' },
    { property: 'og:title', content: 'Pricing | Briko' },
    { property: 'og:description', content: 'Start free; Premium upgrades coming soon.' },
    { property: 'og:url', content: 'https://briko.app/pricing' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Pricing | Briko' },
    { name: 'twitter:description', content: 'Start free with Briko’s mosaic builder. Upgrade for unlimited exports, avatars, and premium MOC packs.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/pricing' }
  ]
})

// (No local components needed)

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const pricingWebPage = webPageJsonLd(
  siteUrl,
  '/pricing',
  'Pricing',
  'Start free with Briko’s mosaic builder. Upgrade for unlimited exports, avatars, and premium MOC packs.'
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
  <main class="px-6 py-16 max-w-6xl mx-auto">
    <h1 class="text-4xl font-extrabold">Pricing</h1>

    <div class="mt-10 grid md:grid-cols-2 gap-6">
      <!-- Free Plan -->
      <div class="rounded-2xl p-6 bg-white/5 backdrop-blur border border-white/10 shadow-soft-card transition hover:-translate-y-0.5 hover:shadow-mint-glow/30">
        <h3 class="text-xl font-bold">Free</h3>
        <div class="mt-2 text-3xl font-extrabold">$0</div>
        <ul class="mt-4 space-y-2 opacity-90">
          <li>• Mosaic builder</li>
          <li>• PNG / CSV exports</li>
          <li>• Basic voxel preview</li>
        </ul>
        <NuxtLink to="/mosaic" class="inline-block mt-6 btn-pink focus-cyber">Try Mosaic</NuxtLink>
      </div>

      <!-- Pro Plan (coming soon) -->
      <div class="rounded-2xl p-6 bg-white/5 backdrop-blur border border-white/10 shadow-soft-card transition hover:-translate-y-0.5 hover:shadow-mint-glow/30">
        <h3 class="text-xl font-bold">Pro (coming soon)</h3>
        <ul class="mt-4 space-y-2 opacity-90">
          <li>• Unlimited exports</li>
          <li>• Avatar posters</li>
          <li>• Curated MOC packs</li>
          <li>• Save & share projects</li>
        </ul>
        <NuxtLink to="#waitlist" class="inline-block mt-6 btn-pink focus-cyber">Join Waitlist</NuxtLink>
      </div>
    </div>

    <div class="mt-12">
      <h2 class="text-2xl font-bold">FAQ</h2>
      <details class="mt-4 p-4 rounded-xl border border-white/10">
        <summary class="font-semibold cursor-pointer">Is Briko affiliated with LEGO®?</summary>
        <p class="mt-2 opacity-80">No. Briko is independent and not affiliated with the LEGO® Group.</p>
      </details>
      <details class="mt-3 p-4 rounded-xl border border-white/10">
        <summary class="font-semibold cursor-pointer">Will my projects be public?</summary>
        <p class="mt-2 opacity-80">You control sharing. Projects will be private by default when accounts launch.</p>
      </details>
      <details class="mt-3 p-4 rounded-xl border border-white/10">
        <summary class="font-semibold cursor-pointer">What’s the refund policy?</summary>
        <p class="mt-2 opacity-80">Pro isn’t live yet; we’ll publish terms before launch.</p>
      </details>
    </div>

    <div id="waitlist" class="mt-2"></div>
  </main>
  
</template>

<style scoped lang="postcss">
.card{ @apply rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10; }
</style>
