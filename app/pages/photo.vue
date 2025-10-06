<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import { signedUrl } from '@/lib/signed-url'

const route = useRoute()
const { $supabase } = useNuxtApp() as any

const loading = ref(true)
const error = ref<string | null>(null)
const img = ref<string | null>(null)
const projectName = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const remixId = route.query.remix as string | undefined
    if (!remixId) {
      error.value = 'No project specified.'
      return
    }
    const { data, error: qErr } = await $supabase
      .from('projects')
      .select('name, original_path, mosaic_path, thumbnail_path')
      .eq('id', remixId)
      .maybeSingle()
    if (qErr || !data) {
      error.value = 'Project not found.'
      return
    }
    projectName.value = data.name ?? null
    img.value =
      (await signedUrl(data.original_path)) ||
      (await signedUrl(data.mosaic_path)) ||
      (await signedUrl(data.thumbnail_path)) ||
      null
    if (!img.value) error.value = 'No preview available.'
  } catch (e: any) {
    error.value = e?.message || 'Failed to load project.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Photo</h1>
        <NuxtLink to="/studio" class="btn-purple-outline focus-cyber">Back to Studio</NuxtLink>
      </header>

      <div v-if="loading" class="text-[color:var(--dark)/.7]">Loading…</div>
      <div v-else-if="error" class="text-[color:var(--dark)/.7]">{{ error }}</div>

      <div v-else class="rounded-2xl overflow-hidden border border-[color:var(--dark)/.15] bg-white/60 p-2">
        <figure class="bg-black/5 grid place-items-center">
          <img v-if="img" :src="img" :alt="projectName || 'Project'" class="max-h-[70vh] w-auto object-contain" />
          <div v-else class="p-8 text-[color:var(--dark)/.7]">No image to display.</div>
        </figure>
      </div>
    </div>
  </main>
</template>
