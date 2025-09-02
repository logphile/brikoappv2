<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div v-if="loading" class="opacity-70">Loading…</div>
    <div v-else-if="error" class="text-red-300">{{ error }}</div>
    <template v-else>
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ proj?.title }}</h1>
          <p class="text-sm opacity-80">{{ proj?.width }}×{{ proj?.height }} studs · Public view</p>
        </div>
        <NuxtLink to="/login" class="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 text-sm">Login to edit</NuxtLink>
      </header>

      <section class="mt-6 grid gap-4">
        <figure class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-center min-h-64">
          <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="max-h-[60vh] rounded-xl" />
          <div v-else class="opacity-70">No preview available</div>
        </figure>

        <div v-if="tiling" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <h2 class="font-medium mb-2">Estimated Cost</h2>
          <div class="text-lg">${{ estTotal.toFixed(2) }}</div>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useNuxtApp } from 'nuxt/app'

const route = useRoute()
const { $supabase } = useNuxtApp() as any

const loading = ref(true)
const error = ref('')
const proj = ref<any | null>(null)
const tiling = ref<any | null>(null)
const assets = ref<any[] | null>(null)
const previewUrl = ref('')

const estTotal = computed(() => {
  const v = tiling.value?.est_total as any
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
})

onMounted(async () => {
  loading.value = true
  try {
    const token = String(route.params.token || '')
    const { data, error: err } = await $supabase.rpc('project_public_view', { p_share_token: token })
    if (err) throw err
    const row = Array.isArray(data) ? data[0] : null
    if (!row || !row.project) {
      error.value = 'Project not found or not public.'
    } else {
      proj.value = row.project
      tiling.value = row.tiling
      assets.value = row.assets || []
      const preview = (assets.value as any[]).find(a => a.kind === 'preview_png')
      if (preview) {
        const { data: urlData } = $supabase.storage.from('public').getPublicUrl(preview.storage_path)
        previewUrl.value = urlData.publicUrl
      }
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load project.'
  } finally {
    loading.value = false
  }
})
</script>
