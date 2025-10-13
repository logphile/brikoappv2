<template>
  <div class="min-h-dvh flex flex-col bg-[var(--brand-bg)]">
    <AppHeader />
    <div class="flex-1">
      <NuxtLayout>
        <NuxtPage :key="$route.fullPath" />
      </NuxtLayout>
    </div>
    <AppFooter />
    <ToastHost />
    <PrivacyBanner />
    <!-- vue-sonner toaster host -->
    <Toaster position="top-right" expand rich-colors theme="dark" :duration="2500" />
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from 'nuxt/app'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.client.vue'
import PrivacyBanner from '@/components/PrivacyBanner.vue'
import { useSiteMeta } from '@/composables/useSiteMeta'
import { Toaster } from 'vue-sonner'

const { siteName, siteUrl } = useSiteMeta()
// Inject the Cloudflare Web Analytics beacon during SSR/SSG so it appears in View-Source
const token = useRuntimeConfig().public.cloudflareAnalyticsToken
useHead({
  link: [
    { rel: 'preconnect', href: 'https://briko.app' },
    { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossorigin: '' },
    { rel: 'preconnect', href: 'https://www.google-analytics.com', crossorigin: '' },
    { rel: 'preconnect', href: 'https://static.cloudflareinsights.com', crossorigin: '' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@0..1&display=swap' }
  ],
  script: token
    ? [{
      key: 'cf-beacon',
      src: `https://static.cloudflareinsights.com/beacon.min.js?token=${token}`,
      defer: true
    }]
    : []
})
// GA is loaded only after consent via plugins/ga.client.ts
// Global preconnects for critical origins
useHead({
  link: [
    { rel: 'preconnect', href: 'https://briko.app' },
    { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossorigin: '' },
    { rel: 'preconnect', href: 'https://www.google-analytics.com', crossorigin: '' },
    { rel: 'preconnect', href: 'https://static.cloudflareinsights.com', crossorigin: '' }
  ]
})
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

<style src="@/assets/css/main.css"></style>
