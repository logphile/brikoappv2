<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useHead } from 'nuxt/app'
import VoxelPreview from '@/components/VoxelPreview.client.vue'
import MosaicUploader from '@/components/MosaicUploader.client.vue'
import { useMosaicStore } from '@/stores/mosaic'
import { downloadPng } from '@/lib/exporters'
import { exportLayersPdf } from '@/lib/printPdf'
import type { VoxelGrid, VoxelWorkerOut } from '@/types/voxel'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'
import { createWorkerTask } from '@/utils/worker-task'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import { copy } from '@/lib/copy'
import StepChips from '@/components/StepChips.vue'

const vox = ref<VoxelGrid | null>(null)
const loading = ref(false)
const progress = ref(0)
const size = ref(64) // 64³ target
const mode = ref<'layered'|'relief'|'hollow'>('layered')
const previewRef = ref<any>(null)
const mosaic = useMosaicStore()
const srcBitmap = ref<ImageBitmap | null>(null)
const voxelTask = createWorkerTask<VoxelWorkerOut>(() => import('@/workers/voxel.worker?worker').then((m:any) => new m.default()))

// SEO
useHead({
  title: 'Voxel Builder',
  meta: [
    { name: 'description', content: 'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.' },
    { property: 'og:title', content: 'Voxel Builder | Briko' },
    { property: 'og:description', content: 'Preview your ideas in 3D voxel bricks. Rotate, zoom, and generate a layered build guide with Briko.' },
    { property: 'og:url', content: 'https://briko.app/voxel' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Voxel Builder | Briko' },
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

function exportPng(){ downloadPng('briko-voxel.png') }
async function uploadPreview(){ await mosaic.uploadPreview() }

async function onExportPdf(){
  const vp = previewRef.value
  if (!vp || !vp.renderer || !vp.scene || !vp.camera) return
  await exportLayersPdf({
    renderer: vp.renderer,
    scene: vp.scene,
    camera: vp.camera,
    totalLayers: typeof vp.depth === 'function' ? vp.depth() : vp.depth,
    setLayer: (k:number) => vp.setLayer?.(k),
    colorCountsForLayer: (k:number) => vp.getCountsForLayer?.(k) || {}
  })
}

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
function toFront(){ previewRef.value?.toFront?.() }
function toIso(){ previewRef.value?.toIso?.() }
function toTop(){ previewRef.value?.toTop?.() }

// Auto-load a colorful default image so the palette mapping is obvious
onMounted(async () => {
  if (vox.value || loading.value) return
  try {
    const res = await fetch('/demo-original.jpg')
    if (!res.ok) return
    const blob = await res.blob()
    await onFile(new File([blob], 'demo-original.jpg', { type: blob.type }))
  } catch (err) {
    console.warn('Default demo image load failed', err)
  }
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">{{ copy.builder3d.title }}</h1>
    <p class="opacity-80">{{ copy.builder3d.subtitle }}</p>
    <StepChips :steps="copy.builder3d.steps" />

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="space-y-4">
        <MosaicUploader @file="onFile" />
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm">Resolution</label>
          <select v-model.number="size" class="select-mint">
            <option :value="32">32³</option>
            <option :value="64">64³</option>
          </select>
        </div>
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm mb-1">3D mode</label>
          <select v-model="mode" class="select-mint w-full">
            <option value="layered">Layered Mosaic (default)</option>
            <option value="relief">Relief (height-map)</option>
            <option value="hollow">Layered (hollow)</option>
          </select>
        </div>
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm mb-1">View</label>
          <div class="flex gap-2">
            <button class="btn-soft h-9 px-3 rounded-md" @click="toFront">Front</button>
            <button class="btn-soft h-9 px-3 rounded-md" @click="toIso">Iso</button>
            <button class="btn-soft h-9 px-3 rounded-md" @click="toTop">Top</button>
          </div>
        </div>
        <p v-if="vox" class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
      <section class="lg:col-span-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-2">
        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">
          <div class="w-2/3 max-w-md text-center space-y-3">
            <div>Processing… <span v-if="progress">{{ progress }}%</span></div>
            <div class="h-2 w-full bg-white/10 rounded">
              <div class="h-2 bg-white/60 rounded" :style="{ width: Math.max(2, progress) + '%' }"></div>
            </div>
          </div>
        </div>
        <VoxelPreview v-else-if="vox" :vox="vox" :mode="mode" ref="previewRef"/>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
        <div v-if="vox" class="px-2 pb-2 flex gap-2 flex-wrap">
          <button class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20" @click="exportPng">Export PNG</button>
          <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40 hover:bg-white/20 disabled:hover:bg-white/10" :disabled="!mosaic.currentProjectId" @click="uploadPreview">Upload Preview</button>
          <button class="btn-mint h-10 px-4 rounded-xl" @click="onExportPdf">One-click PDF</button>
        </div>
        <p v-if="vox" class="px-2 pb-3 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
    </div>
  </main>
</template>
