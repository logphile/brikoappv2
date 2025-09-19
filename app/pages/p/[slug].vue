<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead, useNuxtApp, navigateTo } from 'nuxt/app'
import { createError } from 'h3'
import { useProjects } from '@/composables/useProjects'

const route = useRoute()
const id = (route.params.slug as string).split('-')[0]

const loading = ref(true)
const project = ref<any | null>(null)
const notFound = ref(false)

const { $supabase } = useNuxtApp() as any
const { buildPreviewUrl } = useProjects()

function ver(row: any){
  const d = row?.updated_at || row?.created_at
  try { return new Date(d).getTime() } catch { return Date.now() }
}

function pub(p?: string | null){ return p ? buildPreviewUrl(p) : '' }

const previewUrl = computed(() => project.value ? `${pub(project.value.preview_path)}?v=${ver(project.value)}` : '')
const originalUrl = computed(() => {
  if (!project.value) return ''
  const derived = typeof project.value.preview_path === 'string' ? project.value.preview_path.replace(/\/preview\.png$/i, '/original.png') : null
  const orig = project.value.original_path || project.value.original_preview_path || derived
  return orig ? `${pub(orig)}?v=${ver(project.value)}` : ''
})

const showOriginal = ref(false)

onMounted(async () => {
  try {
    if (!$supabase) throw new Error('Supabase unavailable')
    const { data, error } = await $supabase
      .from('user_projects_public')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!data || !data.preview_path) {
      notFound.value = true
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }
    project.value = data
    // Head tags once data is available
    useHead({
      title: `${data.title} · Briko`,
      meta: [
        { name: 'description', content: data?.title || 'Community project' },
        { property: 'og:title', content: data?.title || 'Briko Project' },
        { property: 'og:image', content: `${pub(data.preview_path)}?v=${ver(data)}` },
        { name: 'twitter:card', content: 'summary_large_image' },
      ]
    })
  } catch (e) {
    // swallow; template will show 404 state
    console.warn('[View project] load failed', e)
  } finally {
    loading.value = false
  }
})

function slugify(input: string){
  return (input || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,64)
}

function remixProject(){
  if (!project.value) return
  const kind = (project.value.kind || '').toLowerCase()
  const src = originalUrl.value || previewUrl.value
  const query: Record<string, string> = { src, from: project.value.id }
  const path = kind === 'voxel' ? '/voxel' : (kind === 'avatar' ? '/avatar' : '/mosaic')
  return navigateTo({ path, query })
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-8 text-white">
    <div v-if="loading" class="opacity-70">Loading…</div>
    <div v-else-if="notFound || !project" class="opacity-80">Project not found.</div>
    <div v-else>
      <header class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold truncate">{{ project.title }}</h1>
          <p class="text-sm text-white/75">by {{ project.username || '@user' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-mint px-4 rounded-xl" @click="remixProject">🔄 Remix</button>
        </div>
      </header>

      <section class="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <div class="p-4">
          <div class="flex items-center gap-2 mb-3">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="showOriginal" />
              <span>Show original</span>
            </label>
          </div>
          <div class="relative aspect-[4/3] bg-white/5 overflow-hidden">
            <img v-if="previewUrl" :src="previewUrl" alt="Mosaic preview"
                 class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                 :class="{ 'opacity-0': showOriginal }" />
            <img v-if="originalUrl" :src="originalUrl" alt="Original"
                 class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 opacity-0"
                 :class="{ 'opacity-100': showOriginal }" />
          </div>
        </div>
      </section>

      <section class="mt-4 grid gap-3 text-sm text-white/80">
        <div class="flex items-center gap-3">
          <span>{{ (project.bricks || 0).toLocaleString() }} bricks</span>
          <span class="opacity-50">·</span>
          <span>${{ (project.cost_est || 0).toLocaleString() }} est.</span>
        </div>
        <div v-if="Array.isArray(project.tags) && project.tags.length" class="flex flex-wrap gap-1">
          <span v-for="t in project.tags" :key="t" class="text-[11px] px-2 py-0.5 rounded-full bg-white/7 ring-1 ring-white/10 text-white/80">#{{ t }}</span>
        </div>
      </section>
    </div>
  </main>
</template>
