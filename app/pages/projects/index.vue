<template>
  <main class="min-h-screen">
    <!-- Page container -->
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Header -->
      <header class="pt-8 sm:pt-10">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--briko-ink-900)]">
          My Gallery
        </h1>
        <p class="mt-2 text-sm opacity-80">Your saved builds. Private by default—make them public to share.</p>
      </header>

      <!-- Cards grid -->
      <section class="mt-6 sm:mt-8">
        <MyGalleryGrid />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import MyGalleryGrid from '@/components/gallery/MyGalleryGrid.vue'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ requiresAuth: true })

useHead({ title: 'My Gallery — Briko' })
</script>
