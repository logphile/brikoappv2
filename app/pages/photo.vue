<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedUrl } from '@/lib/signed-url'
import BricklinkExportDialog from '@/components/export/BricklinkExportDialog.vue'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false, middleware: ['auth'] })

// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T

const route = useRoute()
const supabase = useSupabaseClient() as SupabaseClient

const loading = ref(true)
const error = ref<string | null>(null)
const img = ref<string | null>(null)
const projectName = ref<string | null>(null)

// BrickLink Export dialog state
const showBricklink = ref(false)
async function exportXml(){
  try { console.log('[photo] Export BrickLink XML requested') } catch {}
  showBricklink.value = false
}

// The id comes from ?remix=<id> OR /photo/<id>
const projectId = computed(() => {
  const q = (route.query?.remix ?? (route as any)?.params?.id ?? '').toString().trim()
  return q || ''
})

onMounted(loadProject)
watch(projectId, () => loadProject(), { flush: 'post' })

async function loadProject() {
  loading.value = true
  error.value = null
  img.value = null
  projectName.value = null

  try {
    if (!projectId.value) {
      error.value = 'No project specified.'
      return
    }

    // DEV sanity: prove we’re using the real client
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log('[typeof supabase.from]', typeof (supabase as any)?.from)
    }

    const { data, error: qErr } = await supabase
      .from('projects')
      .select('id,name,original_path,mosaic_path,thumbnail_path,created_at,is_public')
      .eq('id', projectId.value)
      .maybeSingle()

    if (qErr) throw qErr
    if (!data) {
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
    // eslint-disable-next-line no-console
    console.error('[photo load failed]', e)
    error.value = e?.message || 'Failed to load project.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Photo</h1>
        <div class="flex items-center gap-2">
          <button class="btn-purple-outline focus-cyber" @click="showBricklink = true">Export for BrickLink (.xml)</button>
          <NuxtLink to="/studio" class="btn-purple-outline focus-cyber">Back to Studio</NuxtLink>
        </div>
      </header>

      <div v-if="loading" class="text-[color:var(--dark)/.7]">Loading…</div>
      <div v-else-if="error" class="text-[color:var(--dark)/.7]">{{ error }}</div>

      <div v-else class="rounded-2xl overflow-hidden border border-[color:var(--dark)/.15] bg-white/60 p-2">
        <figure class="bg-black/5 grid place-items-center">
          <img v-if="img" :src="img" :alt="projectName || 'Project'" class="max-h-[70vh] w-auto object-contain" />
          <div v-else class="p-8 text-[color:var(--dark)/.7]">No image to display.</div>
        </figure>
      </div>
      <BricklinkExportDialog v-model:open="showBricklink" @export="exportXml" />
    </div>
  </main>
</template>
