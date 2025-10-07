<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">My Gallery</h1>
      <p class="text-sm mt-1 text-[#343434]/80 dark:text-white/70">
        Your saved builds. Private by default—make them public to share.
      </p>
    </header>

    <MyGalleryGrid />
  </div>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import MyGalleryGrid from '@/components/gallery/MyGalleryGrid.vue'

useHead({ title: 'My Gallery — Briko' })
</script>
