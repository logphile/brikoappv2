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
import ButtonPrimary from '@/components/ui/ButtonPrimary.vue'
import ButtonOutline from '@/components/ui/ButtonOutline.vue'
import UploadIcon from '@/components/ui/UploadIcon.vue'
// (computed imported above)
import { legoPalette as LEGO_PALETTE } from '@/lib/palette/lego'
import { useProjects } from '@/composables/useProjects'

// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false })

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

// Stepper data and gating
const steps3d = [
  { id: 'upload', title: 'Upload', icon: 'cloud_upload' },
  { id: 'voxelize', title: 'Voxelize', icon: 'grid_view' },
  { id: 'build-steps', title: 'Build steps', icon: 'layers' },
  { id: 'preview', title: '3D preview', icon: 'view_in_ar' },
]
const activeStepIndex = computed(() => {
  if (vox.value) return 3
  if (srcBitmap.value || loading.value) return 1
  return 0
})

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
      const entry = LEGO_PALETTE[i] as any
      const hex = (entry?.hex && typeof entry.hex === 'string') ? entry.hex : '#999999'
      out.push({ idx: i, name: (entry?.name ?? `Color ${i}`) as string, hex, count: counts[i] })
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

// Export a simple CSV based on palette counts
function exportCsv(){
  if (!vox.value) return
  const counts = new Map<number, number>()
  const arr = vox.value.colors
  for (let i=0;i<arr.length;i++) { const ci = arr[i]; if (ci !== 255) counts.set(ci, (counts.get(ci) || 0) + 1) }
  const rows = [['ColorName','Hex','Qty']]
  counts.forEach((qty, idx) => {
    const entry = LEGO_PALETTE[idx] as any
    const name = (entry?.name || `Color ${idx}`) as string
    const hex = (entry?.hex && typeof entry.hex === 'string') ? entry.hex : '#999999'
    rows.push([name, hex, String(qty)])
  })
  const csv = rows.map(r => r.map(v => /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'briko-voxel.csv'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// Quick sample loader
async function useSample(){
  try {
    let res = await fetch('/samples/parrot-32.png')
    if (!res.ok) res = await fetch('/demo-original.jpg')
    if (!res.ok) return
    const blob = await res.blob()
    await onFile(new File([blob], 'sample.png', { type: blob.type }))
  } catch (e) { console.warn('Sample load failed', e) }
}

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
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  // Precondition
  if (!vox.value) { console.warn('[Voxel] Nothing to publish yet'); return }
  try {
    const { publishProject } = useProjects()
    const title = `3D Build ${vox.value.w}×${vox.value.h}×${vox.value.depth}`
    await publishProject(galleryProjectId.value, { title })
  } catch (e: any) {
    console.error('[Voxel Make Public] error:', e)
  }
}


</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-10 text-[#343434] mb-20">
    <!-- Page header -->
    <h1 class="text-[#343434] text-4xl md:text-5xl font-bold">{{ copy.builder3d.title }}</h1>
    <p class="text-[#2F3061] text-lg md:text-xl mb-8">{{ copy.builder3d.subtitle }}</p>

    <!-- Stepper / mode tabs -->
    <nav aria-label="Quick guide" class="mt-8 flex flex-wrap gap-6 md:gap-8 items-center">
      <a v-for="(s, i) in steps3d" :key="s.id" :href="'#' + s.id"
         :class="[
           'rounded-lg min-h-[40px] px-4 py-2 flex items-center gap-3 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
           (i <= activeStepIndex) ? 'bg-[#FF0062] text-[#FFD808] shadow-md' : 'bg-[#2F3061] text-white'
         ]">
        <UploadIcon v-if="s.id==='upload'" class="w-5 h-5" />
        <span v-else class="material-symbols-rounded text-[20px]" :class="(i <= activeStepIndex) ? 'text-[#FFD808]' : 'text-white'" aria-hidden="true">{{ s.icon }}</span>
        <span class="text-sm" :class="(i <= activeStepIndex) ? 'font-semibold' : ''">{{ s.title }}</span>
      </a>
    </nav>

    <!-- Two-column layout -->
    <div class="mt-8 grid gap-8 lg:gap-12 lg:grid-cols-[460px,1fr] items-start">
      <!-- Controls panel (left) -->
      <aside class="lg:col-span-1">
        <div class="bg-[#FFD808] card-outline-soft rounded-xl shadow-sm p-6 space-y-6">
          <!-- Upload -->
          <section id="upload" class="scroll-mt-28 pt-2">
            <div class="flex items-center gap-3 mb-1">
              <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-[#FF0062]" aria-hidden="true">cloud_upload</span>
              </div>
              <h2 class="text-lg font-semibold text-[#343434]">Upload</h2>
            </div>
            <div class="pt-2">
              <UploadBox :maxSizeMB="25" accept="image/*" :label="'Drag a photo here or'" :buttonText="'browse'" @file="onFile" @error="(msg) => console.warn(msg)" />
            </div>
          </section>

          <div class="divide-y divide-[#343434]/10">
            <!-- Voxel settings -->
            <section class="pt-4 pb-6">
              <h3 class="text-lg font-semibold text-[#343434] mb-1">Voxel settings</h3>
              <div class="flex items-center gap-2 mb-1">
                <label class="block text-sm text-[#2F3061]">Resolution</label>
                <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs" style="background:rgba(255,0,98,.12); color:#FF0062;">{{ size }}³</span>
              </div>
              <input type="range" min="16" max="96" step="8" v-model.number="size" class="range-pink">
              <div class="text-xs text-[#2F3061] mt-1">Higher = more detail (slower).</div>
            </section>

            <!-- Lighting -->
            <section class="pt-4 pb-6">
              <h3 class="text-lg font-semibold text-[#343434] mb-1">Lighting</h3>
              <div class="flex items-center gap-2 mb-1">
                <label class="block text-sm text-[#2F3061]">Brightness</label>
                <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs" style="background:rgba(255,0,98,.12); color:#FF0062;">{{ exposure.toFixed(1) }}×</span>
              </div>
              <input type="range" min="0.8" max="1.6" step="0.1" v-model.number="exposure" class="range-pink" />
            </section>

            <!-- Build steps -->
            <section class="pt-4 pb-6">
              <h3 class="text-lg font-semibold text-[#343434] mb-1">Build steps</h3>
              <p class="text-sm text-[#2F3061]">Control how many layers per step.</p>
            </section>

            <!-- Export -->
            <section class="pt-4 pb-0">
              <h3 class="text-lg font-semibold text-[#343434] mb-3">Export</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-4 sm:space-y-0">
                <ButtonPrimary type="button" variant="pink" class="rounded-lg px-4 py-2 hover:bg-[#FF0062]/90 active:translate-y-[1px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="pdfWorking || !vox" :aria-busy="pdfWorking" @click.stop.prevent="previewRef?.exportPdf?.()">
                  <span v-if="!pdfWorking">One-click PDF</span>
                  <span v-else>Generating…</span>
                </ButtonPrimary>
                <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!vox" @click="exportPng">Export PNG</ButtonOutline>
                <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!vox" @click="exportCsv">Export CSV</ButtonOutline>
              </div>
            </section>
          </div>

          <!-- Primary/secondary actions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-4 sm:space-y-0">
            <ButtonPrimary type="button" variant="pink" class="rounded-lg px-4 py-2 hover:bg-[#FF0062]/90 active:translate-y-[1px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!srcBitmap || loading" :aria-busy="loading" @click="scheduleRegen">{{ vox ? 'Rebuild' : 'Run voxelize' }}</ButtonPrimary>
            <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" @click="useSample">Use sample</ButtonOutline>
          </div>

          <!-- Save/Publish -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-4 sm:space-y-0">
            <ButtonPrimary type="button" variant="pink" class="rounded-lg px-4 py-2 hover:bg-[#FF0062]/90 active:translate-y-[1px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!vox || publishing" :aria-busy="publishing" @click="publishToGallery">Save to Gallery (private)</ButtonPrimary>
            <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!galleryProjectId" @click="makePublic">Make Public</ButtonOutline>
          </div>

        </div>
      </aside>

      <!-- Viewport panel (right) -->
      <section class="lg:col-span-1 rounded-xl shadow-lg ring-1 ring-[#343434]/20 bg-[#2F3061] p-6 relative">
        <!-- Toolbar top-right -->
        <div class="absolute right-3 top-3 z-10 flex gap-2">
          <button type="button" title="Reset camera" class="inline-flex items-center justify-center rounded-md border border-white/30 text-white/90 hover:bg-[#343434] px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]" @click="previewRef?.resetCam?.()">Reset</button>
          <button type="button" title="Toggle grid" class="inline-flex items-center justify-center rounded-md border border-white/30 text-white/90 hover:bg-[#343434] px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]" @click="previewRef?.toggleGrid?.()">Grid</button>
          <button type="button" title="Wireframe" class="inline-flex items-center justify-center rounded-md border border-white/30 text-white/90 hover:bg-[#343434] px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]" @click="previewRef?.toggleWire?.()">Wire</button>
          <button type="button" title="Lighting" class="inline-flex items-center justify-center rounded-md border border-white/30 text-white/90 hover:bg-[#343434] px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]" @click="previewRef?.toggleLight?.()">Light</button>
        </div>

        <div v-if="loading" class="h-[480px] grid place-items-center opacity-90">
          <div class="w-2/3 max-w-md text-center space-y-3 text-white">
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

        <!-- Palette swatches -->
        <div v-if="vox && paletteUsed.length" class="mt-3">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-xs text-white/80">Colors used in this build ({{ paletteUsed.length }}):</span>
            <div class="flex flex-wrap gap-1">
              <div v-for="c in paletteUsed" :key="c.idx" class="w-4 h-4 rounded-sm ring-1 ring-white/10" :style="{ backgroundColor: c.hex }" :title="`${c.name} (${c.count.toLocaleString()} bricks)`"></div>
            </div>
          </div>
        </div>
        <p v-if="vox" class="mt-2 text-xs text-white/70">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
    </div>
  </main>
</template>
