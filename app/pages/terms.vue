<template>
  <main class="mx-auto max-w-3xl px-6 py-12 text-white">
    <h1 class="text-3xl font-semibold mb-4">Terms of Service</h1>
    <p class="opacity-80 mb-6">These terms govern your use of Briko.</p>

    <section class="space-y-4 leading-relaxed opacity-90">
      <p>
        Briko is provided "as is" without warranty of any kind. You agree to use the service responsibly and in
        compliance with applicable laws.
      </p>
      <p>
        Uploaded content remains yours. You grant us a limited license to process files to generate mosaics, voxel
        renders, and instructions. We do not claim ownership over your creations.
      </p>
      <p>
        We may update these terms from time to time. Continued use of Briko after changes constitutes acceptance of the
        updated terms.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const siteUrl = 'https://briko.app'
const name = 'Terms of Service | Briko'
const description = 'Read the terms that govern your use of Briko.'

useHead({
  title: name,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: name },
    { property: 'og:description', content: description },
    { property: 'og:url', content: `${siteUrl}/terms` },
    { property: 'og:image', content: `${siteUrl}/og-default.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: name },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${siteUrl}/og-default.png` }
  ],
  link: [{ rel: 'canonical', href: `${siteUrl}/terms` }]
})

const webPage = webPageJsonLd(siteUrl, '/terms', name, description)
const crumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Terms', path: '/terms' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(webPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(crumbs) }
  ]
})
</script>
