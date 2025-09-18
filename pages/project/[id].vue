<template>
  <main class="mx-auto max-w-6xl px-6 py-8 text-white">
    <header class="mb-4">
      <h1 class="text-2xl font-semibold truncate">{{ title || 'Project' }}</h1>
      <p class="text-sm text-white/75">by {{ username || '@user' }}</p>
    </header>

    <section class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <div class="p-4">
        <div v-if="mosaicUrl && originalUrl" class="mb-3">
          <BeforeAfter :before-url="mosaicUrl" :after-url="originalUrl" :height="Math.min(540, Math.max(360, innerHeight*0.6))"/>
        </div>
        <div v-else class="grid place-items-center h-[360px] bg-white/5">
          <img v-if="mosaicUrl" :src="mosaicUrl" alt="Mosaic preview" class="max-h-[360px] object-contain" loading="lazy" decoding="async"/>
          <div v-else class="opacity-70">No preview available</div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BeforeAfter from '@/components/ui/BeforeAfter.vue'
import { useProjects } from '@/composables/useProjects'
import { useNuxtApp } from 'nuxt/app'

const route = useRoute()
const id = route.params.id as string
const mosaicUrl = ref<string>('')
const originalUrl = ref<string>('')
const title = ref<string>('')
const username = ref<string>('')
const innerHeight = typeof window !== 'undefined' ? window.innerHeight : 720

onMounted(async () => {
  const { $supabase } = useNuxtApp() as any
  const { buildPreviewUrl } = useProjects()
  if (!$supabase) return
  try {
    const { data, error } = await $supabase
      .from('user_projects_public')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    title.value = data?.title || ''
    username.value = data?.username || data?.display_name || '@user'
    mosaicUrl.value = data?.preview_path ? buildPreviewUrl(data.preview_path) : ''
    originalUrl.value = data?.original_preview_path ? buildPreviewUrl(data.original_preview_path) : ''
  } catch (e) {
    console.error(e)
  }
})
</script>
