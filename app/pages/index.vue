<template>
  <div class="mx-auto max-w-5xl px-4 py-16">
    <div class="mb-8 text-center">
      <img :src="bannerUrl" alt="BrickMOC" class="mx-auto mb-6 h-28 w-auto" />
      <h1 class="mb-2 text-3xl font-bold">BrickMOC Companion</h1>
      <p class="text-white/70">Turn any idea or image into a LEGO-style build preview with a parts list.</p>
    </div>
    <div class="flex justify-center">
      <NuxtLink to="/studio">
        <AppButton>Open Studio</AppButton>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import bannerUrl from '@/assets/banner.svg?url'
</script>
