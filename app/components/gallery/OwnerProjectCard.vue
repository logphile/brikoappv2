<template>
  <article class="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-sm">
    <div class="aspect-[4/3] bg-black/5 flex items-center justify-center">
      <img
        v-if="url"
        :src="url"
        alt=""
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="text-sm opacity-60">No preview</div>
    </div>

    <div class="p-3 flex items-center justify-between">
      <div class="font-medium truncate">{{ p.name || 'Untitled' }}</div>
      <div class="text-xs opacity-70">{{ dateLocal }}</div>
    </div>

    <div class="px-3 pb-3">
      <NuxtLink
        :to="`/studio/${p.id}`"
        class="inline-flex items-center text-sm rounded-md px-3 py-1.5 bg-white/90 text-black hover:bg-white cursor-pointer"
      >
        View
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { signedUrl } from '@/lib/signed-url'

const props = defineProps<{ p: any }>()
const url = ref<string | null>(null)

onMounted(async () => {
  // priority: thumbnail → mosaic → original
  url.value =
    (await signedUrl(props.p.thumbnail_path)) ||
    (await signedUrl(props.p.mosaic_path)) ||
    (await signedUrl(props.p.original_path)) ||
    null
})

const dateLocal = computed(() => {
  try { return new Date(props.p?.created_at).toLocaleDateString() } catch { return '' }
})
</script>
