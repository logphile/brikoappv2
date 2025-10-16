<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedUrl } from '@/lib/signed-url'
import { fromNowSafe, formatDateSafe } from '@/utils/date'
import BricklinkExportDialog from '@/components/export/BricklinkExportDialog.vue'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false, middleware: ['auth'] })

// Nuxt auto-imported composable
declare const useSupabaseClient: <T = any>() => T

const route = useRoute()
const supabase = useSupabaseClient() as SupabaseClient

const projectId = computed(() => (route.query?.remix ?? (route as any)?.params?.id ?? '').toString().trim())

const project = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')
const img = ref<string | null>(null)

const showBricklink = ref(false)
async function exportBricklink(p?: any){
  try { console.log('[photo] Export BrickLink XML requested', p?.id) } catch {}
  showBricklink.value = false
}

onMounted(load)
watch(projectId, load, { flush: 'post' })

async function load () {
  loading.value = true
  errorMsg.value = ''
  project.value = null
  img.value = null
  try {
    if (!projectId.value) { errorMsg.value = 'No project id.'; return }
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log('[typeof supabase.from]', typeof (supabase as any)?.from)
    }
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, user_id, name, created_at, is_public,
        width, height, part_count, palette_name,
        original_path, mosaic_path, thumbnail_path, voxel_path, user_id,
        profiles:profiles!projects_user_id_fkey ( handle )
      `)
      .eq('id', projectId.value)
      .maybeSingle()
    let result = data as any
    if (error) {
      const msg = String((error as any)?.message || '')
      if (/relationship|foreign key|does not exist/i.test(msg)) {
        const { data: proj, error: projErr } = await supabase
          .from('projects')
          .select('id,user_id,name,created_at,is_public,width,height,part_count,palette_name,original_path,mosaic_path,thumbnail_path,voxel_path')
          .eq('id', projectId.value)
          .maybeSingle()
        if (projErr) throw projErr
        if (!proj) { errorMsg.value = 'Project not found.'; return }
        let handle: string | undefined
        if ((proj as any)?.user_id) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('handle')
            .eq('id', (proj as any).user_id)
            .maybeSingle()
          handle = (prof as any)?.handle
        }
        result = { ...(proj as any), profiles: handle ? { handle } : undefined }
      } else {
        throw error
      }
    }
    if (!result) { errorMsg.value = 'Project not found.'; return }
    project.value = result

    img.value =
      (await signedUrl(project.value.original_path)) ||
      (await signedUrl(project.value.mosaic_path)) ||
      (await signedUrl(project.value.thumbnail_path)) ||
      null
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e)
    errorMsg.value = e?.message ?? 'Failed to load project.'
  } finally {
    loading.value = false
  }
}

const submittedAbs = computed(() => formatDateSafe(project.value?.created_at))
const submittedRel = ref('')
watchEffect(async () => { submittedRel.value = await fromNowSafe(project.value?.created_at) })

const siblings = ref<{ prev?: any; next?: any }>({})
async function loadSiblings(userId: string, createdAt: string){
  try {
    const prev = await supabase
      .from('projects')
      .select('id, name, thumbnail_path, created_at')
      .eq('user_id', userId)
      .lt('created_at', createdAt).order('created_at', { ascending:false }).limit(1)
    const next = await supabase
      .from('projects')
      .select('id, name, thumbnail_path, created_at')
      .eq('user_id', userId)
      .gt('created_at', createdAt).order('created_at', { ascending:true }).limit(1)
    siblings.value = { prev: prev.data?.[0], next: next.data?.[0] }
  } catch {}
}
watch(project, (p) => {
  if (p?.user_id && p?.created_at) loadSiblings(p.user_id, p.created_at)
})

function shareUrl(id: string){ return `${location.origin}/photo?remix=${id}` }
async function copy(text: string){ try{ await navigator.clipboard.writeText(text) } catch{} }
async function downloadMosaic(){
  const el = document.querySelector('#mosaic-frame') as HTMLElement | null
  if(!el) return
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 })
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = (project.value?.name || 'briko-mosaic') + '.png'
  a.click()
}
</script>

<template>
  <main class="min-h-screen bg-[var(--yellow)] text-[var(--dark)]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Photo</h1>
        <div class="flex items-center gap-3">
          <button class="btn btn-purple" @click="exportBricklink(project)">Export for BrickLink (.xml)</button>
          <NuxtLink to="/studio" class="btn btn-purple">Back to Studio</NuxtLink>
        </div>
      </header>

      <div v-if="loading" class="text-[color:var(--dark)/.7]">Loading…</div>
      <div v-else-if="errorMsg" class="text-[color:var(--dark)/.7]">{{ errorMsg }}</div>

      <div v-else class="rounded-2xl overflow-hidden border border-[color:var(--dark)/.15] bg-white/60 p-2">
        <figure id="mosaic-frame" class="bg-black/5 grid place-items-center">
          <img v-if="img" :src="img" :alt="project?.name || 'Project'" class="max-h-[70vh] w-auto object-contain" />
          <div v-else class="p-8 text-[color:var(--dark)/.7]">No image to display.</div>
        </figure>
      </div>
      <!-- META -->
      <div v-if="project" class="meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span v-if="project.profiles?.handle" class="font-medium">@{{ project.profiles.handle }}</span>

        <span class="dim">
          {{ submittedAbs }}
          <span v-if="submittedRel"> ({{ submittedRel }})</span>
        </span>

        <span v-if="project.is_public" class="badge badge-green">Public</span>
        <span v-else class="badge badge-gray">Private</span>

        <span v-if="project.width && project.height" class="dim">
          {{ project.width }} × {{ project.height }} studs
        </span>

        <span v-if="project.part_count" class="dim">
          {{ project.part_count.toLocaleString() }} parts
        </span>

        <span v-if="project.palette_name" class="dim">
          Palette: {{ project.palette_name }}
        </span>

        <!-- quick actions -->
        <button
          v-if="project.original_path"
          class="btn btn-ghost h-8 px-3 text-xs"
          @click="copy(project.original_path)"
        >Copy original URL</button>

        <button
          v-if="project.mosaic_path"
          class="btn btn-ghost h-8 px-3 text-xs"
          @click="downloadMosaic()"
        >Download PNG</button>

        <NuxtLink
          :to="`/studio?remix=${project.id}`"
          class="btn btn-ghost h-8 px-3 text-xs"
        >Remix</NuxtLink>

        <button
          class="btn btn-ghost h-8 px-3 text-xs"
          @click="copy(shareUrl(project.id))"
        >Copy share link</button>

        <NuxtLink
          v-if="project.voxel_path"
          :to="`/3d?project=${project.id}`"
          class="btn btn-ghost h-8 px-3 text-xs"
        >Open in 3D Builder</NuxtLink>
      </div>

      <div class="flex items-center gap-2 mt-2" v-if="siblings.prev || siblings.next">
        <NuxtLink
          v-if="siblings.prev"
          :to="`/photo?remix=${siblings.prev.id}`"
          class="btn btn-ghost h-8 px-3 text-xs"
        >← Prev</NuxtLink>
        <NuxtLink
          v-if="siblings.next"
          :to="`/photo?remix=${siblings.next.id}`"
          class="btn btn-ghost h-8 px-3 text-xs"
        >Next →</NuxtLink>
      </div>
      <BricklinkExportDialog v-model:open="showBricklink" @export="exportBricklink(project)" />
    </div>
  </main>
</template>
