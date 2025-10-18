<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useMyGallery } from '@/composables/useMyGallery'
import MyProjectCard from '@/components/gallery/MyProjectCard.vue'

const { items, loading, ready, refresh } = useMyGallery()

function onDeleted(e: any){
  try {
    const id = String(e?.detail ?? '')
    if (!id) return
    items.value = items.value.filter(p => String(p.id) !== id)
  } catch {}
}

onMounted(() => {
  try { window.addEventListener('project:deleted', onDeleted as any, { passive: true }) } catch {}
})
onBeforeUnmount(() => {
  try { window.removeEventListener('project:deleted', onDeleted as any) } catch {}
})
</script>

<template>
  <ClientOnly>
    <div v-if="!ready" class="opacity-70 text-sm">Sign in to view your projects.</div>
    <div v-else-if="loading" class="opacity-70 text-sm">Loading…</div>
    <div v-else-if="!items.length" class="mt-16 rounded-2xl bg-[var(--briko-purple-900)]/90 text-white ring-1 ring-white/10 p-10 text-center">
      <h3 class="text-lg font-medium">Nothing here yet</h3>
      <p class="mt-2 opacity-80">Create something in Photo to Bricks or Briko Studio, then save it.</p>
      <NuxtLink to="/photo" class="inline-flex mt-5 h-11 items-center rounded-xl px-4 ring-1 ring-white/15 bg-white/10 hover:bg-white/15 transition">
        Start a new build
      </NuxtLink>
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <MyProjectCard v-for="p in items" :key="p.id" :p="p" />
    </div>
  </ClientOnly>
</template>
