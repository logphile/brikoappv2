<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted, computed } from 'vue'
import { useHead, useNuxtApp } from 'nuxt/app'
import { useRoute } from 'vue-router'
import VoxelPreview from '@/components/VoxelPreview.client.vue'
import UploadBox from '@/components/ui/UploadBox.vue'
import Empty3DPlaceholder from '@/components/ui/Empty3DPlaceholder.vue'
import { useMosaicStore } from '@/stores/mosaic'
// PNG export now uses the child component's exportPng() method via ref
// import { exportLayersPdf } from '@/lib/printPdf' // not used by One-click PDF anymore
import type { VoxelGrid, VoxelWorkerOut } from '@/types/voxel'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'
import { createWorkerTask } from '@/utils/worker-task'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import { copy } from '@/lib/copy'
import StepChips from '@/components/StepChips.vue'
// (computed imported above)
import { LEGO_PALETTE } from '@/lib/legoPalette'
import { useProjects } from '@/composables/useProjects'

const vox = ref<VoxelGrid | null>(null)
const loading = ref(false)
const progress = ref(0)
const size = ref(64) // 64³ target
const mode = ref<'layered'|'relief'|'hollow'>('layered')
const exposure = ref(1.1)
const debug = ref<{ useBasicMaterial: boolean; paintRainbow12: boolean; wireframe: boolean; hideMesh?: boolean; showBounds?: boolean }>({ useBasicMaterial: false, paintRainbow12: false, wireframe: false, hideMesh: false, showBounds: false })
const previewRef = ref<any>(null)
const pdfWorking = ref(false)
function onExporting(b:boolean){ pdfWorking.value = b }
const mosaic = useMosaicStore()
const srcBitmap = ref<ImageBitmap | null>(null)
const voxelTask = createWorkerTask<VoxelWorkerOut>(() => import('@/workers/voxel.worker?worker').then((m:any) => new m.default()))
// Build-time dev flag for template conditions (avoid using import.meta in template expressions)
const isDev = process.dev

// Debug flag from URL (?debug3d)
const route = useRoute()
const debug3d = computed(() => 'debug3d' in route.query)
const showDebug = computed(() => process.dev || ('debug3d' in route.query))
const autoDemo = computed(() => 'demo' in route.query)

// Empty placeholder grid for debug3d mounting (all empty voxels)
const emptyVox: VoxelGrid = { w: 32, h: 32, depth: 1, colors: new Uint8Array(32 * 32 * 1).fill(255) as Uint8Array }

// Mode help copy
const modeHelp = computed(() => {
  return mode.value === 'relief'
    ? 'Stud heights vary by image brightness.'
    : mode.value === 'hollow'
      ? 'Outer shell + roof only (fewer bricks).'
      : 'Flat layer-by-layer studs in LEGO colors.'
})

// Palette used for this build (counts across the whole grid)
const paletteUsed = computed(() => {
  const v = vox.value
  if (!v) return [] as Array<{ idx:number; name:string; hex:string; count:number }>
  const counts = new Uint32Array(LEGO_PALETTE.length)
  const arr = v.colors
  for (let i=0; i<arr.length; i++) {
    const idx = arr[i]
    if (idx === 255) continue
    if (idx < counts.length) counts[idx]++
  }
  const out: Array<{ idx:number; name:string; hex:string; count:number }> = []
  for (let i=0; i<counts.length; i++) {
    if (counts[i] > 0) {
      const entry = LEGO_PALETTE[i]
      const hex = '#' + ((entry?.hex ?? 0x999999) & 0xFFFFFF).toString(16).padStart(6, '0')
      out.push({ idx: i, name: entry?.name ?? `Color ${i}`, hex, count: counts[i] })
    }
  }
  out.sort((a,b) => b.count - a.count)
  return out
})

// SEO
useHead({
  title: '3D Builder',
  meta: [
    { name: 'description', content: 'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.' },
    { property: 'og:title', content: '3D Builder | Briko' },
    { property: 'og:description', content: 'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.' },
    { property: 'og:url', content: 'https://briko.app/voxel' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: '3D Builder | Briko' },
    { name: 'twitter:description', content: 'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/voxel' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const voxelWebPage = webPageJsonLd(
  siteUrl,
  '/voxel',
  'Voxel Builder',
  'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.'
)
const voxelBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Voxel Builder', path: '/voxel' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(voxelWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(voxelBreadcrumbs) }
  ]
})

async function onFile(file: File) {
  loading.value = true; vox.value = null; progress.value = 0
  srcBitmap.value = await createImageBitmap(file)
  try {
    const msg = await voxelTask.run(
      { image: srcBitmap.value, size: size.value, mode: mode.value },
      { onProgress: (p) => { if (typeof p?.pct === 'number') progress.value = p.pct } }
    )
    if (msg.type === 'done') {
      vox.value = msg.grid
      progress.value = 100
    }
  } catch (e) {
    // likely aborted by a new run
    console.warn(e)
  } finally {
    loading.value = false
  }
}

function exportPng(){ previewRef.value?.exportPng?.('briko-voxel.png', 2, '#0f1422') }
async function uploadPreview(){ await mosaic.uploadPreview() }

// Previous multi-layer PDF export function removed in favor of client-only single-page exporter

// Debounced re-run when resolution changes
let regenTimer: any = null
function scheduleRegen(){
  if (!srcBitmap.value) return
  if (regenTimer) clearTimeout(regenTimer)
  regenTimer = setTimeout(async () => {
    loading.value = true; progress.value = 0
    try {
      const msg = await voxelTask.run(
        { image: srcBitmap.value, size: size.value, mode: mode.value },
        { onProgress: (p) => { if (typeof p?.pct === 'number') progress.value = p.pct } }
      )
      if (msg.type === 'done') {
        vox.value = msg.grid
        progress.value = 100
      }
    } catch (e) {
      console.warn(e)
    } finally {
      loading.value = false
    }
  }, 150)
}
watch(size, scheduleRegen)
watch(mode, scheduleRegen)
onBeforeUnmount(() => voxelTask.cancel())

// Quick view helpers calling child-exposed methods
const view = ref<'front'|'iso'|'top'>('front')
function toFront(){ previewRef.value?.toFront?.(); view.value = 'front' }
function toIso(){ previewRef.value?.toIso?.(); view.value = 'iso' }
function toTop(){ previewRef.value?.toTop?.(); view.value = 'top' }

// Debug: capture unique instance-colors from child and assert against palette bar count
const instUniqueColors = ref<number | null>(null)
watch([paletteUsed, instUniqueColors], ([p, m]) => {
  if (m != null) {
    console.assert(m === p.length, `[Voxel] palette bar count (${p.length}) should equal unique instance colors (${m})`)
    console.log('[Voxel] palette bar colors vs instance colors:', { paletteBar: p.length, uniqueInstanceColors: m })
  }
})

// Remix preload: if a src URL is provided in the query, auto-load it
onMounted(async () => {
  const src = route.query.src as string | undefined
  if (!src) return
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`Failed to fetch source (${res.status})`)
    const blob = await res.blob()
    await onFile(new File([blob], 'remix.png', { type: blob.type || 'image/png' }))
  } catch (e) {
    console.warn('[Voxel Remix preload] failed', e)
  }
})

// Auto-load a colorful default image so the palette mapping is obvious
onMounted(() => { vox.value = null; srcBitmap.value = null })
onMounted(async () => {
  if (!autoDemo.value || vox.value || loading.value) return
  try {
    // Prefer bright parrot sample; fallback to demo image
    let res = await fetch('/samples/parrot-32.png')
    if (!res.ok) res = await fetch('/demo-original.jpg')
    if (!res.ok) return
    const blob = await res.blob()
    await onFile(new File([blob], 'default.png', { type: blob.type }))
  } catch (err) {
    console.warn('Default demo image load failed', err)
  }
})

// Community Gallery publishing (voxel)
const galleryProjectId = ref<string | null>(null)
const publishing = ref(false)
async function publishToGallery(){
  const { $supabase } = useNuxtApp() as any
  const { uploadPreviewPNG, insertUserProject } = useProjects()
  const cvs: HTMLCanvasElement | OffscreenCanvas | undefined = (window as any).__brikoCanvas
  if (!$supabase || !vox.value || !cvs) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  publishing.value = true
  try {
    const projectId = (crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2)
    const path = await uploadPreviewPNG(user.id, projectId, cvs as any)
    // Brick count = number of non-empty voxels
    const arr = vox.value.colors
    let bricks = 0; for (let i=0;i<arr.length;i++){ if (arr[i] !== 255) bricks++ }
    const cost_est = 0
    const title = `3D Build ${vox.value.w}×${vox.value.h}×${vox.value.depth}`
    const rec = await insertUserProject({ id: projectId, user_id: user.id, title, kind: 'voxel', preview_path: path, bricks, cost_est, tags: [] })
    galleryProjectId.value = rec.id
  } catch (e) {
    console.warn(e)
  } finally { publishing.value = false }
}

async function makePublic(){
  if (!galleryProjectId.value) return
  const { $supabase } = useNuxtApp() as any
  const { makePublic } = useProjects()
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  try { await makePublic(galleryProjectId.value, user.id) } catch (e) { console.warn(e) }
}


</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">{{ copy.builder3d.title }}</h1>
    <div class="mt-2 h-1 w-16 rounded-full bg-pink-500/80"></div>
    <p class="opacity-80">{{ copy.builder3d.subtitle }}</p>
    <!-- ... (rest of the template remains the same) -->
    <button class="btn-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!vox || publishing" :aria-busy="publishing" @click="publishToGallery">Save to Gallery (private)</button>
    <button class="btn-outline-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!galleryProjectId" @click="makePublic">Make Public</button>
    <!-- ... (rest of the template remains the same) -->

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="space-y-4">
        <!-- Upload card -->
        <div class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">file_upload</span>
            </div>
            <h2 class="text-sm font-semibold text-white">Upload</h2>
          </div>
          <div class="mt-2 h-1 w-8 rounded bg-pink-500/90"></div>
          <div class="mt-3">
            <UploadBox :maxSizeMB="25" accept="image/*" @file="onFile" @error="(msg) => console.warn(msg)" />
          </div>
        </div>

        <!-- Resolution card -->
        <div class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">grid_4x4</span>
            </div>
            <label class="text-sm font-semibold">Resolution</label>
          </div>
          <select v-model.number="size" class="w-full rounded-xl border border-white/20 bg-white/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option :value="32">32³</option>
            <option :value="64">64³</option>
          </select>
        </div>
        <!-- Brightness card -->
        <div class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">light_mode</span>
            </div>
            <label class="text-sm font-semibold">Brightness</label>
          </div>
          <input type="range" min="0.8" max="1.6" step="0.1" v-model.number="exposure" class="w-full pink-slider" />
          <div class="text-xs text-white/60 mt-1">{{ exposure.toFixed(1) }}×</div>
        </div>
        <!-- 3D mode card -->
        <div class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">layers</span>
            </div>
            <label class="text-sm font-semibold">3D mode</label>
          </div>
          <select v-model="mode" class="w-full rounded-xl border border-white/20 bg-white/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option value="layered">Layered Mosaic (default)</option>
            <option value="relief">Relief (height-map)</option>
            <option value="hollow">Layered (hollow)</option>
          </select>
          <p class="text-xs opacity-70 mt-1">{{ modeHelp }}</p>
        </div>
        <!-- Debug (dev or via ?debug3d) -->
        <div v-if="showDebug" class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">bug_report</span>
            </div>
            <label class="text-sm font-semibold">Debug</label>
          </div>
          <div class="flex flex-col gap-1 text-sm">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.useBasicMaterial" class="accent-pink-500" />
              Use Basic Material
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.paintRainbow12" class="accent-pink-500" />
              Paint First 12 Studs Rainbow
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.wireframe" class="accent-pink-500" />
              Wireframe
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.showBounds" class="accent-pink-500" />
              Show Bounds Helper
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.hideMesh" class="accent-pink-500" />
              Hide Mesh
            </label>
            <div>
              <button class="btn-soft h-8 px-3 rounded-md mt-1" @click="previewRef?.testPaintStuds?.(100)">Draw 100 Test Studs</button>
            </div>
          </div>
          <p class="text-xs opacity-60 mt-1">Helps verify instanceColor path and lighting/tone mapping.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-5 cursor-default select-none">
          <div class="flex items-center mb-2">
            <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70 mr-2">
              <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">view_in_ar</span>
            </div>
            <label class="text-sm font-semibold">View</label>
          </div>
          <div class="flex gap-2">
            <button :class="['rounded-full px-3 py-1 text-sm font-medium', view==='front' ? 'border border-pink-500 text-pink-600 bg-white/70 shadow-sm' : 'border border-white/25 text-gray-900 bg-white/60']" @click="toFront">Front</button>
            <button :class="['rounded-full px-3 py-1 text-sm font-medium', view==='iso' ? 'border border-pink-500 text-pink-600 bg-white/70 shadow-sm' : 'border border-white/25 text-gray-900 bg-white/60']" @click="toIso">Iso</button>
            <button :class="['rounded-full px-3 py-1 text-sm font-medium', view==='top' ? 'border border-pink-500 text-pink-600 bg-white/70 shadow-sm' : 'border border-white/25 text-gray-900 bg-white/60']" @click="toTop">Top</button>
          </div>
        </div>
        <p v-if="vox" class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
      <section class="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 shadow-lg p-2">
        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">
          <div class="w-2/3 max-w-md text-center space-y-3">
            <div>Processing… <span v-if="progress">{{ progress }}%</span></div>
            <div class="h-2 w-full bg-white/10 rounded">
              <div class="h-2 bg-white/60 rounded" :style="{ width: Math.max(2, progress) + '%' }"></div>
            </div>
          </div>
        </div>
        <VoxelPreview v-if="vox || debug3d" :vox="vox ?? emptyVox"
          :mode="mode" :exposure="exposure" :debug="debug" :debug3d="debug3d" ref="previewRef"
          @unique-colors="(n:number)=> instUniqueColors = n" @exporting="onExporting" />
        <Empty3DPlaceholder v-else />
        <!-- Palette swatch bar -->
        <div v-if="vox && paletteUsed.length" class="px-2 pb-2">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-xs opacity-70">Colors used in this build ({{ paletteUsed.length }}):</span>
            <div class="flex flex-wrap gap-1">
              <div v-for="c in paletteUsed" :key="c.idx" class="w-4 h-4 rounded-sm ring-1 ring-white/10" :style="{ backgroundColor: c.hex }" :title="`${c.name} (${c.count.toLocaleString()} bricks)`"></div>
            </div>
          </div>
        </div>
        <div v-if="vox" class="px-2 pb-2 flex gap-2 flex-wrap">
          <button class="btn btn-primary px-4 rounded-xl" @click="exportPng">Export PNG</button>
          <button class="btn-outline-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!mosaic.currentProjectId" @click="uploadPreview">Upload Preview</button>
          <button class="btn-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!vox || publishing" :aria-busy="publishing" @click="publishToGallery">Save to Gallery (private)</button>
          <button class="btn-outline-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!galleryProjectId" @click="makePublic">Make Public</button>
          <button id="one-click-pdf" type="button" class="btn-mint px-4 rounded-xl" :disabled="pdfWorking || !vox" :aria-busy="pdfWorking" @click.stop.prevent="previewRef?.exportPdf?.()">
            <span v-if="!pdfWorking">One-click PDF</span>
            <span v-else>Generating…</span>
          </button>
        </div>
        <p v-if="vox" class="px-2 pb-3 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
    </div>
  </main>
</template>
