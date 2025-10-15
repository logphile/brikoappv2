<template>
  <section class="max-w-6xl mx-auto px-4 py-8 text-[#343434]">
    <header class="mb-6">
      <h1 class="text-3xl font-bold truncate">{{ project?.name || 'Untitled' }}</h1>
      <p v-if="project" class="text-sm opacity-70">
        {{ dateLocal }}<span v-if="dateRelative"> ({{ dateRelative }})</span>
        • {{ project.is_public ? 'Public' : 'Private' }}
        <span v-if="project.width && project.height"> • {{ project.width }}×{{ project.height }}</span>
      </p>
    </header>

    <div class="rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-8 grid place-items-center min-h-[320px]">
      <img v-if="previewUrl" :src="previewUrl" alt="" class="w-full object-contain" />
      <div v-else class="p-10 text-center opacity-70">No preview available</div>
    </div>

    <div class="flex gap-3">
      <NuxtLink to="/studio" class="px-4 py-2 rounded-md bg-white/90 text-black">Back</NuxtLink>
      <NuxtLink v-if="project" :to="{ path: '/mosaic', query: { remix: project.id } }" class="px-4 py-2 rounded-md bg-white/90 text-black hover:bg-white">
        Remix in Editor
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'
import { fromNowSafe, formatDate } from '@/utils/date'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false })

const route = useRoute()
const { $supabase } = useNuxtApp() as any
const id = String(route.params.id || '')

const project = ref<any | null>(null)
const previewUrl = ref<string | null>(null)

const dateLocal = computed(() => formatDate(project.value?.created_at, 'M/D/YYYY'))
const dateRelative = computed(() => fromNowSafe(project.value?.created_at))

async function load(){
  if (!$supabase || !id) return
  const { data, error } = await $supabase
    .from('projects')
    .select('id, name, thumbnail_path, mosaic_path, original_path, is_public, created_at, width, height, data')
    .eq('id', id)
    .single()
  if (error) {
    console.warn('[studio/[id]] load error', error)
    return
  }
  project.value = data
  previewUrl.value =
    (await signedUrl(project.value.thumbnail_path)) ||
    (await signedUrl(project.value.mosaic_path)) ||
    (await signedUrl(project.value.original_path)) ||
    null
}

onMounted(load)
</script>
