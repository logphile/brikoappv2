<template>
  <div class="min-h-dvh flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white">
    <AppHeader />
    <div class="flex-1">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <AppFooter />
    <ToastHost />
    <ConsentBanner />
    <!-- vue-sonner toaster host -->
    <Toaster position="bottom-right" expand rich-colors theme="dark" :duration="2500" />
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from 'nuxt/app'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.client.vue'
import ConsentBanner from '@/components/ConsentBanner.vue'
import { useSiteMeta } from '@/composables/useSiteMeta'
import { Toaster } from 'vue-sonner'

const { siteName, siteUrl } = useSiteMeta()
// Inject the Cloudflare Web Analytics beacon during SSR/SSG so it appears in View-Source
const token = useRuntimeConfig().public.cloudflareAnalyticsToken
useHead({
  script: token
    ? [{
      key: 'cf-beacon',
      src: `https://static.cloudflareinsights.com/beacon.min.js?token=${token}`,
      defer: true
    }]
    : []
})
// Inject Google Tag Manager (with Consent Mode default denied) and GA4 (direct, no GTM GA4 Config tag)
useHead({
  script: [
    {
      key: 'gtm-init',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}

        // Consent Mode v2: default all to denied
        gtag('consent', 'default', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });

        // Load GTM (deferred)
        function loadGtm(){
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WZ7ST45X');
        }
        if ('requestIdleCallback' in window) { requestIdleCallback(loadGtm) } else { setTimeout(loadGtm, 0) }
      `
    },
    {
      key: 'ga4-lib',
      src: 'https://www.googletagmanager.com/gtag/js?id=G-KX0V4MQKTE',
      async: true
    },
    {
      key: 'ga4-init',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        // Initial GA4 config (page_view will be sent once consent is granted)
        gtag('config', 'G-KX0V4MQKTE', { send_page_view: true });
      `
    }
  ],
  noscript: [{
    key: 'gtm-noscript',
    innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WZ7ST45X" height="0" width="0" style="display:none;visibility:hidden"></iframe>'
  }]
})
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
