<template>
  <header class="page-wrap mt-6">
    <h1 class="text-5xl lg:text-6xl font-slab">Terms of Service</h1>
    <p class="prose-muted mt-1">Last updated: {{ lastUpdated }}</p>
  </header>

  <main class="page-wrap mt-6">
    <section class="card p-6">
      <article class="prose-briko">
        <p>These terms govern your use of Briko.</p>

        <h2>Use of the Service</h2>
        <p>
          Briko is provided “as is,” without warranties of any kind. You agree to use the
          service responsibly and in compliance with applicable laws.
        </p>

        <h2>Your Content</h2>
        <p>
          Uploaded content remains yours. You grant us a limited license to process files to
          generate mosaics, voxel renders, and build instructions. We do not claim ownership
          over your creations.
        </p>

        <h2>Accounts</h2>
        <p>
          You’re responsible for activity under your account. Don’t share credentials or
          attempt to circumvent security or limits.
        </p>

        <h2>Prohibited Behavior</h2>
        <ul>
          <li>Illegal, infringing, or harmful content.</li>
          <li>Abuse, scraping, or disrupting the service.</li>
        </ul>

        <h2>Changes & Availability</h2>
        <p>
          We may update features or these terms. Continued use after changes constitutes
          acceptance of the updated terms. Service may be modified or discontinued at any time.
        </p>

        <h2>Liability</h2>
        <p>
          To the fullest extent permitted by law, Briko and its contributors are not liable for
          indirect or consequential damages.
        </p>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:support@briko.app">support@briko.app</a>.</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
const lastUpdated = 'Sept 2025'

const siteUrl = 'https://briko.app'
const name = 'Terms of Service'
const description = 'Read the terms that govern your use of Briko.'

useHead({
  title: name,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'Terms of Service | Briko' },
    { property: 'og:description', content: description },
    { property: 'og:url', content: `${siteUrl}/terms` },
    { property: 'og:image', content: `${siteUrl}/og-default.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Terms of Service | Briko' },
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
