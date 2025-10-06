<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useMyGallery } from '@/composables/useMyGallery'
import MyProjectCard from '@/components/gallery/MyProjectCard.vue'

const { items, loading, ready, refresh } = useMyGallery()

onMounted(() => {
  try { window.addEventListener('project:deleted', refresh as any, { passive: true }) } catch {}
})
onBeforeUnmount(() => {
  try { window.removeEventListener('project:deleted', refresh as any) } catch {}
})
</script>

<template>
  <ClientOnly>
    <div v-if="!ready" class="opacity-70 text-sm">Sign in to view your projects.</div>
    <div v-else-if="loading" class="opacity-70 text-sm">Loading…</div>
    <div v-else-if="!items.length" class="opacity-70 text-sm">Nothing here yet.</div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MyProjectCard v-for="p in items" :key="p.id" :p="p" />
    </div>
  </ClientOnly>
</template>
