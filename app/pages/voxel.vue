<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted, computed } from 'vue'
import { useHead } from 'nuxt/app'
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
function toFront(){ previewRef.value?.toFront?.() }
function toIso(){ previewRef.value?.toIso?.() }
function toTop(){ previewRef.value?.toTop?.() }

// Debug: capture unique instance-colors from child and assert against palette bar count
const instUniqueColors = ref<number | null>(null)
watch([paletteUsed, instUniqueColors], ([p, m]) => {
  if (m != null) {
    console.assert(m === p.length, `[Voxel] palette bar count (${p.length}) should equal unique instance colors (${m})`)
    console.log('[Voxel] palette bar colors vs instance colors:', { paletteBar: p.length, uniqueInstanceColors: m })
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
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">{{ copy.builder3d.title }}</h1>
    <p class="opacity-80">{{ copy.builder3d.subtitle }}</p>
    <StepChips :steps="copy.builder3d.steps" />

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="space-y-4">
        <UploadBox :maxSizeMB="25" accept="image/*" @file="onFile" @error="(msg) => console.warn(msg)" />
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm">Resolution</label>
          <select v-model.number="size" class="select-mint">
            <option :value="32">32³</option>
            <option :value="64">64³</option>
          </select>
        </div>
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm mb-1">Brightness</label>
          <input type="range" min="0.8" max="1.6" step="0.1" v-model.number="exposure" class="w-full range-mint" />
          <div class="text-xs opacity-70 mt-1">{{ exposure.toFixed(1) }}×</div>
        </div>
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm mb-1">3D mode</label>
          <select v-model="mode" class="select-mint w-full">
            <option value="layered">Layered Mosaic (default)</option>
            <option value="relief">Relief (height-map)</option>
            <option value="hollow">Layered (hollow)</option>
          </select>
          <p class="text-xs opacity-70 mt-1">{{ modeHelp }}</p>
        </div>
        <!-- Debug (dev or via ?debug3d) -->
        <div v-if="showDebug" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm mb-1">Debug</label>
          <div class="flex flex-col gap-1 text-sm">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.useBasicMaterial" />
              Use Basic Material
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.paintRainbow12" />
              Paint First 12 Studs Rainbow
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.wireframe" />
              Wireframe
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.showBounds" />
              Show Bounds Helper
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="debug.hideMesh" />
              Hide Mesh
            </label>
            <div>
              <button class="btn-soft h-8 px-3 rounded-md mt-1" @click="previewRef?.testPaintStuds?.(100)">Draw 100 Test Studs</button>
            </div>
          </div>
          <p class="text-xs opacity-60 mt-1">Helps verify instanceColor path and lighting/tone mapping.</p>
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
          <button class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20" @click="exportPng">Export PNG</button>
          <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40 hover:bg-white/20 disabled:hover:bg-white/10" :disabled="!mosaic.currentProjectId" @click="uploadPreview">Upload Preview</button>
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
