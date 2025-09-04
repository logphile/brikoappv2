<template>
  <main class="mx-auto max-w-3xl px-6 py-12 text-white">
    <h1 class="text-3xl font-semibold mb-4">Privacy Policy</h1>
    <p class="opacity-80 mb-6">Your privacy matters. This page outlines what data Briko collects and how it is used.</p>

    <section class="space-y-4 leading-relaxed opacity-90">
      <p>
        We collect minimal analytics to improve the product. We use privacy-friendly Cloudflare Web Analytics which does not
        use cookies or store personal data.
      </p>
      <p>
        Authentication is powered by Supabase. If you sign in, your email address is processed solely to provide access and
        account-related features. We do not sell or share your data with third parties.
      </p>
      <p>
        If you have any questions, contact us at <a class="underline" href="mailto:support@briko.app">support@briko.app</a>.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const siteUrl = 'https://briko.app'
const name = 'Privacy Policy'
const description = 'Learn how Briko collects and uses data. We use privacy-friendly analytics and keep your data safe.'

useHead({
  title: name,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'Privacy Policy | Briko' },
    { property: 'og:description', content: description },
    { property: 'og:url', content: `${siteUrl}/privacy` },
    { property: 'og:image', content: `${siteUrl}/og-default.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Privacy Policy | Briko' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${siteUrl}/og-default.png` }
  ],
  link: [{ rel: 'canonical', href: `${siteUrl}/privacy` }]
})

const webPage = webPageJsonLd(siteUrl, '/privacy', name, description)
const crumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Privacy', path: '/privacy' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(webPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(crumbs) }
  ]
})
</script>
