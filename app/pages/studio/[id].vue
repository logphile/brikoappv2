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
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'nuxt/app'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedUrl } from '@/lib/signed-url'
import { fromNowSafe, formatDateSafe } from '@/utils/date'
import { useDayjs } from '@/composables/useDayjs'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false })

const route = useRoute()
// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T
const supabase = useSupabaseClient() as SupabaseClient
const projectId = String(route.params.id || '')

const project = ref<any | null>(null)
const previewUrl = ref<string | null>(null)

const dayjs = useDayjs()
const dateLocal = computed(() => formatDateSafe(project.value?.created_at, 'M/D/YYYY'))
const dateRelative = ref('')
watchEffect(async () => {
  dateRelative.value = await fromNowSafe(project.value?.created_at)
})

// Active tab preference (mosaic|voxel|overview) read once on mount
const activeTab = ref<'mosaic' | 'voxel' | 'overview'>('mosaic')
onMounted(() => {
  const raw = (route.query.tab as string) || (route.hash ? String(route.hash).replace('#','') : '') || 'mosaic'
  const q = raw.replace(/^\//, '')
  if (['mosaic', 'voxel', 'overview'].includes(q)) activeTab.value = q as any
})

async function load(){
  if (!supabase || !projectId) return
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log('[check] typeof supabase.from =', typeof (supabase as any)?.from)
  }
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, thumbnail_path, mosaic_path, original_path, is_public, created_at, width, height, data')
      .eq('id', projectId)
      .maybeSingle()
    if (error) throw error
    project.value = data
    previewUrl.value =
      (await signedUrl(project.value.thumbnail_path)) ||
      (await signedUrl(project.value.mosaic_path)) ||
      (await signedUrl(project.value.original_path)) ||
      null
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[project load failed]', e)
  }
}

onMounted(load)

if (import.meta.dev) {
  // eslint-disable-next-line no-console
  console.log('[debug] from/fromNow present?', typeof (dayjs() as any).from, typeof (dayjs() as any).fromNow)
}
</script>
