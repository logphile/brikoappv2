<template>
  <AppHeader />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <footer class="mt-10 border-t border-white/10">
    <div class="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm opacity-80">
      <NuxtLink to="/privacy" class="hover:opacity-100">Privacy</NuxtLink>
      <NuxtLink to="/terms" class="hover:opacity-100">Terms</NuxtLink>
      <a href="/sitemap.xml" class="hover:opacity-100">Sitemap</a>
      <span class="ml-auto">© {{ new Date().getFullYear() }} {{ siteName }}</span>
    </div>
  </footer>
  <ToastHost />
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import AppHeader from '@/components/AppHeader.vue'
import ToastHost from '@/components/ToastHost.client.vue'
import { useSiteMeta } from '@/composables/useSiteMeta'

const { siteName, siteUrl } = useSiteMeta()
const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['WebApplication','SoftwareApplication'],
  name: siteName,
  url: siteUrl,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  description: 'Create LEGO-style mosaics and voxel builds in seconds. Upload, preview, export parts list and build guides.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    category: 'Free'
  },
  image: `${siteUrl}/og-default.png`,
  sameAs: [],
  isAccessibleForFree: true
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(appJsonLd)
    }
  ]
})
</script>
