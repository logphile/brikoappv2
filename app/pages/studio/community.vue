<template>
  <div class="mx-auto max-w-7xl px-6 py-10 text-white">
    <h1 class="text-2xl font-bold mb-4">Community Projects</h1>
    <CommunityGrid />
  </div>
</template>

<script setup lang="ts">
import CommunityGrid from '@/components/CommunityGrid.vue'
// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false, middleware: ['auth'] })
</script>
