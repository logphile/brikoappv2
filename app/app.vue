<template>
  <AppHeader />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastHost />
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ToastHost from '@/components/ToastHost.client.vue'
</script>
