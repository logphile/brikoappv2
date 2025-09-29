import { defineNuxtPlugin, useHead, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const siteUrl = (useRuntimeConfig().public as any)?.siteUrl || 'https://briko.app'
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Briko',
    url: siteUrl,
    logo: `${siteUrl}/brand/briko-wordmark-accent.svg`
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Briko',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/gallery?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  useHead({
    script: [
      { key: 'ld-org', type: 'application/ld+json', innerHTML: JSON.stringify(org) },
      { key: 'ld-website', type: 'application/ld+json', innerHTML: JSON.stringify(website) }
    ]
  })
})
