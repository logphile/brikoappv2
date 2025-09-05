<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Community Studio</h1>
        <p class="opacity-80 text-sm">Explore public builds and remixes from the Briko community.</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/login" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">Log in to create your own Studio</NuxtLink>
        <NuxtLink to="/projects" class="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40">Your Projects</NuxtLink>
      </div>
    </header>

    <section class="mt-8">
      <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
        <h2 class="font-semibold">Jump into the gallery</h2>
        <p class="opacity-80 text-sm mt-1">See trending and new creations, like and remix your favorites.</p>
        <NuxtLink to="/gallery" class="inline-block mt-4 px-4 py-2 rounded-xl bg-cta-grad">Open Community Gallery</NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

useHead({
  title: 'Community Studio',
  meta: [
    { name: 'description', content: 'Explore public builds and remixes from the Briko community.' },
    { property: 'og:title', content: 'Community Studio | Briko' },
    { property: 'og:description', content: 'Explore public builds and remixes from the Briko community.' },
    { property: 'og:url', content: 'https://briko.app/community-studio' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Community Studio | Briko' },
    { name: 'twitter:description', content: 'Explore public builds and remixes from the Briko community.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/community-studio' }
  ]
})
</script>
