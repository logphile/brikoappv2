<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <header class="mb-6">
        <h1 class="text-3xl md:text-4xl font-extrabold">Privacy Policy</h1>
        <div class="mt-2 h-[3px] w-12 rounded-full" style="background:#2F3061"></div>
        <p class="mt-2 text-[color:#343434B3] text-sm">Last updated: {{ lastUpdated }}</p>
      </header>

      <!-- readable content surface -->
      <article class="card-ivory rounded-2xl p-6 sm:p-8 legal-prose">
        <p>Your privacy matters. This page outlines what data Briko collects and how it’s used.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Analytics:</strong> Privacy-friendly Cloudflare Web Analytics (no cookies, no personal data).</li>
          <li><strong>Authentication:</strong> Email address via Supabase to provide account features.</li>
          <li><strong>Projects:</strong> Images/metadata you upload or create in Briko Studio.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>Operate the app, improve performance, and troubleshoot.</li>
          <li>No sale of personal data. No third-party ads.</li>
        </ul>

        <h2>Storage &amp; sharing</h2>
        <ul>
          <li>Project files are stored in Supabase Storage. Public projects are visible to anyone with the link.</li>
          <li>We may retain logs for security and abuse prevention.</li>
        </ul>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:support@briko.app">support@briko.app</a>.</p>
      </article>
    </div>
  </main>
  
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'

const siteUrl = 'https://briko.app'
const name = 'Privacy Policy'
const description = 'Learn how Briko collects and uses data. We use privacy-friendly analytics and keep your data safe.'
const lastUpdated = 'Sept 2025'

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
