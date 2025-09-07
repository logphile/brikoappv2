<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useHead } from 'nuxt/app'
import MosaicUploader from '@/components/MosaicUploader.client.vue'
import MosaicCanvas from '@/components/MosaicCanvas.client.vue'
import StepCanvas from '@/components/StepCanvas.client.vue'
import VoxelViewer from '@/components/VoxelViewer.client.vue'
import LayerSlider from '@/components/LayerSlider.client.vue'
import RegeneratingChip from '@/components/RegeneratingChip.vue'
import { legoPalette } from '@/lib/palette/lego'
import { chunkSteps } from '@/lib/steps'
import type { WorkerOut } from '@/types/mosaic'
import { useMosaicStore } from '@/stores/mosaic'
import { exportBuildGuidePDF } from '@/lib/pdfExport'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'
import { createWorkerTask } from '@/utils/worker-task'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import { useToasts } from '@/composables/useToasts'
import { imageBitmapToBuffer } from '@/utils/image-to-buffer'

const mosaic = useMosaicStore()
const { show: showToast } = useToasts()

// SEO
useHead({
  title: 'Mosaic Builder',
  meta: [
    { name: 'description', content: 'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.' },
    { property: 'og:title', content: 'Mosaic Builder | Briko' },
    { property: 'og:description', content: 'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.' },
    { property: 'og:url', content: 'https://briko.app/mosaic' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Mosaic Builder | Briko' },
    { name: 'twitter:description', content: 'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/mosaic' }
  ]
})

// JSON-LD: WebPage + Breadcrumbs
const siteUrl = 'https://briko.app'
const mosaicWebPage = webPageJsonLd(
  siteUrl,
  '/mosaic',
  'Mosaic Builder',
  'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.'
)
const mosaicBreadcrumbs = breadcrumbJsonLd(siteUrl, [
  { name: 'Home', path: '/' },
  { name: 'Mosaic Builder', path: '/mosaic' }
])

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(mosaicWebPage) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(mosaicBreadcrumbs) }
  ]
})

const target = ref<{w:number,h:number}>({ w: 128, h: 128 })
const grid = ref<WorkerOut|null>(null)
const loading = ref(false)
const progress = ref(0)
const showGrid = ref(true)
// Default dithering off so larger tiles can merge; users can enable if desired
const useDither = ref(false)
const tab = ref<'2D'|'3D'>('2D')
// drag-n-drop on preview area + global guard
const dropActive = ref(false)
// UI toggles
const showPlates = ref(false)
// Advanced options gate
const showAdvanced = ref(false)
// Preview quality for first pass
const previewQuality = ref(64) // studs on first progressive run
// Size readouts helpers
const mmPerStud = 8
const inPerMm = 1/25.4
const widthInches = computed(()=> ((target.value.w * mmPerStud) * inPerMm))
const heightInches = computed(()=> ((target.value.h * mmPerStud) * inPerMm))
const widthCm = computed(()=> (target.value.w * mmPerStud) / 10)
const heightCm = computed(()=> (target.value.h * mmPerStud) / 10)

// Keep the last ImageBitmap to support re-runs without re-decoding
const srcBitmap = ref<ImageBitmap|null>(null)
const mosaicTask = createWorkerTask<WorkerOut>(() => import('@/workers/mosaic.worker?worker').then((m:any) => new m.default()))

// Allowed parts multiselect
const ALL_PARTS = ['2x4','2x3','2x2','1x4','1x3','1x2','1x1'] as const
const selectedParts = ref<string[]>([...ALL_PARTS])
watch(selectedParts, (val)=>{
  mosaic.setAllowedParts(val as any)
  try { showToast('Re-generating with your piece choices…', 'info', 1800) } catch {}
}, { immediate: true })

async function onFile(file: File) {
  loading.value = true; grid.value = null; progress.value = 0
  mosaic.setUiWorking('manual')
  try {
    srcBitmap.value = await createImageBitmap(file)
    // Cancel any in-flight tiling when a new image is loaded
    mosaic.cancelTiling()

    // Progressive: fast thumb (no tiling yet), then full-size indexes
    const { buffer: buf64, width: w64, height: h64 } = await imageBitmapToBuffer(srcBitmap.value!, previewQuality.value, previewQuality.value)
    const thumb = await mosaicTask.run(
      { type: 'process', buffer: buf64, width: w64, height: h64, palette: legoPalette, greedy: false, dither: useDither.value },
      { onProgress: (p)=> { if (typeof p?.pct === 'number') progress.value = p.pct }, timeoutMs: 30000, transfer: [buf64] }
    )
    grid.value = thumb

    const { buffer: bufFull0, width: w0, height: h0 } = await imageBitmapToBuffer(srcBitmap.value!, target.value.w, target.value.h)
    const full = await mosaicTask.run(
      { type: 'process', buffer: bufFull0, width: w0, height: h0, palette: legoPalette, greedy: false, dither: useDither.value },
      { onProgress: (p)=> { if (typeof p?.pct === 'number') progress.value = p.pct }, timeoutMs: 30000, transfer: [bufFull0] }
    )
    grid.value = full
    // Hook to store for tiling: always use undithered quantizedIndexes for better merging
    mosaic.setTargetSize(full.width, full.height)
    mosaic.setGrid((full.quantizedIndexes || full.indexes) as Uint16Array, full.width, full.height)
    // auto-run tiling so exports and 3D become available
    await mosaic.runGreedyTiling()
  } catch (e: any) {
    console.error(e)
    mosaic.status = 'error'
    ;(mosaic as any).errorMsg = e?.message ? String(e.message) : String(e)
  } finally {
    loading.value = false; progress.value = 0
    mosaic.clearUiWorking()
  }
}

async function onGenerate(){
  mosaic.setUiWorking('manual')
  try { await mosaic.runGreedyTiling() } finally { mosaic.clearUiWorking() }
}

async function saveNow(){ await mosaic.saveProject() }
async function uploadPrev(){ await mosaic.uploadPreview() }

// Share & buy helpers
function currentUrl(){ try { return window.location.href } catch { return 'https://briko.app/mosaic' } }
function copyLink(){
  const url = currentUrl()
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(()=>{ try { showToast('Link copied to clipboard', 'success') } catch {} })
  }
}
function shareX(){ const u = encodeURIComponent(currentUrl()); const t = encodeURIComponent('Check out my Briko mosaic!'); window.open(`https://twitter.com/intent/tweet?url=${u}&text=${t}`,'_blank') }
function shareFB(){ const u = encodeURIComponent(currentUrl()); window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`,'_blank') }
function shareReddit(){ const u = encodeURIComponent(currentUrl()); const t = encodeURIComponent('My Briko mosaic'); window.open(`https://www.reddit.com/submit?url=${u}&title=${t}`,'_blank') }
function whereToBuy(){ window.open('https://briko.app/help/buy-bricks','_blank') }

// Steps (kept for compatibility when using legacy greedy placements)
const stepIdx = ref(1)
const steps = computed(()=> (grid.value?.placements) ? chunkSteps(grid.value.placements, 300) : [])
watch(steps, ()=>{ stepIdx.value = steps.value.length ? 1 : 0 })

function handleDrop(e: DragEvent) {
  e.preventDefault(); e.stopPropagation()
  dropActive.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) onFile(f)
}
function handleDragOver(e: DragEvent) {
  e.preventDefault(); e.stopPropagation()
  dropActive.value = true
}
function handleDragLeave(e: DragEvent) {
  e.preventDefault(); e.stopPropagation()
  dropActive.value = false
}

// Global safety: don’t open the file in the browser if drop misses the zones.
function preventWindowDrop(e: DragEvent) {
  if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
    e.preventDefault()
  }
}
onMounted(()=>{ window.addEventListener('dragover', preventWindowDrop); window.addEventListener('drop', preventWindowDrop) })
onBeforeUnmount(()=>{ window.removeEventListener('dragover', preventWindowDrop); window.removeEventListener('drop', preventWindowDrop); mosaicTask.cancel(); mosaic.cancelTiling() })

// Debounced regeneration when size/dither changes (with queue)
let regenTimer: any = null
let regenQueued = false
function scheduleRegen(){
  if (!srcBitmap.value) return
  // If a regeneration/tiling is already in progress, queue a follow-up
  if (mosaic.status === 'working' || mosaic.status === 'tiling') { regenQueued = true; return }
  if (regenTimer) clearTimeout(regenTimer)
  regenTimer = setTimeout(async () => {
    try {
      // non-blocking UI regeneration indicator via chip
      mosaic.setUiWorking('auto');
      progress.value = 0
      // Cancel any in-flight tiling right before we start the new quantization
      mosaic.cancelTiling()
      const { buffer: bufFull, width: w, height: h } = await imageBitmapToBuffer(srcBitmap.value!, target.value.w, target.value.h)
      const full = await mosaicTask.run(
        { type: 'process', buffer: bufFull, width: w, height: h, palette: legoPalette, greedy: false, dither: useDither.value },
        { onProgress: (p)=> { if (typeof p?.pct === 'number') progress.value = p.pct }, timeoutMs: 30000, transfer: [bufFull] }
      )
      grid.value = full
      mosaic.setTargetSize(full.width, full.height)
      mosaic.setGrid((full.quantizedIndexes || full.indexes) as Uint16Array, full.width, full.height)
      // auto-run tiling after any re-quantization
      await mosaic.runGreedyTiling()
    } catch (e: any) {
      // swallow aborted runs
      console.warn(e)
      // surface non-abort errors to store
      if (!(e && e.name === 'AbortError')) {
        mosaic.status = 'error'
        ;(mosaic as any).errorMsg = e?.message ? String(e.message) : String(e)
      }
    } finally {
      mosaic.clearUiWorking();
      progress.value = 0
      if (regenQueued) { regenQueued = false; // flush queued change
        // Let tick apply latest reactive values before rerun
        requestAnimationFrame(() => scheduleRegen())
      }
    }
  }, 150)
}
watch(() => target.value.w, scheduleRegen)
watch(() => target.value.h, scheduleRegen)
watch(useDither, scheduleRegen)
// Debounced retile when allowed parts or orientation changes (with queue)
let retileTimer: any = null
let retileQueued = false
function scheduleRetile(){
  if (!mosaic.grid) return
  if (mosaic.status === 'working' || mosaic.status === 'tiling') { retileQueued = true; return }
  if (retileTimer) clearTimeout(retileTimer)
  retileTimer = setTimeout(async () => {
    mosaic.setUiWorking('auto')
    try { await mosaic.runGreedyTiling() }
    finally {
      mosaic.clearUiWorking()
      if (retileQueued) { retileQueued = false; requestAnimationFrame(() => scheduleRetile()) }
    }
  }, 200)
}
watchDebounced(
  () => [mosaic.settings.allowedParts, mosaic.settings.snapOrientation],
  () => scheduleRetile(),
  { debounce: 250, maxWait: 1000, deep: true }
)
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">Mosaic</h1>
    <p class="opacity-80">Upload an image → map to brick colors → preview & export.</p>

    <div class="mt-6 grid lg:grid-cols-[380px,1fr] gap-6">
      <!-- left column -->
      <Transition appear enter-active-class="transition ease-out duration-600"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0">
      <section class="lg:col-span-1 space-y-4">
        <MosaicUploader @file="onFile" />
        <div class="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 shadow-soft-card hover:shadow-mint-glow/30 transition space-y-3 divide-y divide-white/5">
          <div class="flex items-center justify-between">
            <label class="block text-sm">Output size (studs)</label>
            <div class="text-xs bg-white/10 rounded-md overflow-hidden">
              <button :class="['px-2 py-1', !showAdvanced ? 'bg-white/20' : '']" @click="showAdvanced=false">Simple</button>
              <button :class="['px-2 py-1', showAdvanced ? 'bg-white/20' : '']" @click="showAdvanced=true">Advanced</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label>Width
              <input type="range" min="16" max="256" step="1" v-model.number="target.w" @change="mosaic.setTargetSize(target.w, target.h)" class="range-mint">
            </label>
            <label>Height
              <input type="range" min="16" max="256" step="1" v-model.number="target.h" @change="mosaic.setTargetSize(target.w, target.h)" class="range-mint">
            </label>
          </div>
          <div class="flex justify-between items-center text-sm mt-2">
            <span class="text-white/70">Output size (studs)</span>
            <span class="font-medium text-mint">{{ target.w }} × {{ target.h }}</span>
          </div>
          <div class="text-xs opacity-70">≈ {{ target.w }}×{{ target.h }} studs · {{ widthInches.toFixed(1) }}×{{ heightInches.toFixed(1) }} in · {{ widthCm.toFixed(1) }}×{{ heightCm.toFixed(1) }} cm</div>

          <div class="mt-3" v-if="showAdvanced">
            <label class="block text-sm" title="Pieces you want to build with">Allowed parts</label>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <label v-for="p in ALL_PARTS" :key="p" class="inline-flex items-center gap-2">
                <input type="checkbox" :value="p" v-model="selectedParts"> {{ p.replace('x','×') }}
              </label>
            </div>
          </div>
          <div class="mt-3" v-if="showAdvanced">
            <label class="block text-sm">Orientation</label>
            <div class="flex items-center mt-1">
              <select v-model="mosaic.settings.snapOrientation" class="bg-black/40 rounded px-3 py-2">
                <option value="both">Both</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
              <label class="ml-3 flex items-center gap-1 select-none">
                <input type="checkbox" v-model="showGrid" class="accent-current" />
                <span>Show stud grid</span>
              </label>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm mt-2" v-if="showAdvanced">
            <input type="checkbox" v-model="useDither"> Smoother shading (dithering)
          </label>
          <div class="mt-2 text-sm">
            <label>Preview quality
              <select v-model.number="previewQuality" class="ml-2 bg-black/40 rounded px-2 py-1">
                <option :value="32">Fast (32×32)</option>
                <option :value="64">Balanced (64×64)</option>
                <option :value="96">Sharper (96×96)</option>
                <option :value="128">High (128×128)</option>
              </select>
            </label>
          </div>
          <div class="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <button class="btn-mint w-full" :disabled="!grid || mosaic.status==='tiling'" :title="!grid ? 'Upload an image to enable' : ''" @click="onGenerate">Generate Mosaic</button>
            <button class="px-4 py-2 rounded-2xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.tilingResult || mosaic.status==='working' || mosaic.status==='tiling'" :title="!mosaic.tilingResult ? 'Upload an image to enable' : ''" @click="mosaic.exportPNG">Export PNG</button>
            <button class="px-4 py-2 rounded-2xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.tilingResult || mosaic.status==='working' || mosaic.status==='tiling'" :title="!mosaic.tilingResult ? 'Upload an image to enable' : ''" @click="() => exportBuildGuidePDF({ bricks: mosaic.tilingResult!.bricks, width: mosaic.width, height: mosaic.height, fileName: `mosaic_${mosaic.width}x${mosaic.height}_${Date.now()}.pdf` })">Export PDF</button>
            <button class="px-4 py-2 rounded-2xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.tilingResult || mosaic.status==='working' || mosaic.status==='tiling'" :title="!mosaic.tilingResult ? 'Upload an image to enable' : ''" @click="mosaic.exportCSV">Export CSV</button>
            <button class="px-4 py-2 rounded-2xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.currentProjectId" :title="!mosaic.currentProjectId ? 'Create or open a project to enable' : ''" @click="saveNow">Save Project</button>
            <button class="px-4 py-2 rounded-2xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.currentProjectId || !mosaic.tilingResult" :title="(!mosaic.currentProjectId || !mosaic.tilingResult) ? 'Generate and save a project first' : ''" @click="uploadPrev">Upload Preview</button>
          </div>
        </div>
        <!-- Shopping List inside left column -->
        <div v-if="mosaic.tilingResult" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div class="font-semibold mb-2">Shopping List</div>
          <ul class="max-h-64 overflow-auto text-sm space-y-1">
            <li v-for="row in mosaic.tilingResult.bom" :key="row.part + '-' + row.colorId" class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-sm ring-1 ring-white/20" :style="{ backgroundColor: (legoPalette[row.colorId]?.hex || '#ccc') }"></span>
                <span class="opacity-80">{{ legoPalette[row.colorId]?.name || ('Color '+row.colorId) }}</span>
                <span class="opacity-60">· Plate {{ row.part.replace('x','×') }}</span>
              </div>
              <div class="text-right">
                <div>{{ row.qty }} pcs</div>
                <div class="opacity-70 text-xs">${{ row.estTotal.toFixed(2) }}</div>
              </div>
            </li>
          </ul>
          <div class="mt-3 text-sm opacity-80">Est. cost: ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}</div>
          <p class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
        </div>
      </section>
      </Transition>
      

      <!-- right preview with dropzone -->
      <Transition appear enter-active-class="transition ease-out duration-700 delay-150"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0">
      <section
        class="lg:col-span-2 relative rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 shadow-soft-card"
        :aria-busy="mosaic.status==='working' || mosaic.status==='tiling'"
        @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop"
      >
        <RegeneratingChip />
        <div v-if="dropActive"
             class="absolute inset-0 rounded-2xl ring-2 ring-white/40 bg-white/5 pointer-events-none"></div>
        <div class="flex items-center gap-3 text-sm mb-4">
          <button :class="['px-3 py-1.5 rounded-full transition', tab==='2D' ? 'bg-mint/15 text-white border border-mint/40' : 'text-white/70 hover:text-white']" @click="tab='2D'">2D Mosaic</button>
          <button :class="['px-3 py-1.5 rounded-full transition', tab==='3D' ? 'bg-mint/15 text-white border border-mint/40' : 'text-white/70 hover:text-white']" @click="tab='3D'">3D Preview</button>
          <div class="grow"></div>
          <label v-if="tab==='2D'" class="ml-auto inline-flex items-center gap-2 text-white/80">
            <input type="checkbox" class="accent-mint" v-model="showPlates" />
            <span>Show plate outlines</span>
          </label>
          <div v-if="mosaic.status==='error'" class="ml-2 text-xs text-red-300 bg-red-500/10 px-3 py-1.5 rounded-full">
            Generation failed — {{ mosaic.errorMsg }}
          </div>
          <button class="rounded-xl border border-white/10 px-3 py-1.5 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.tilingResult || mosaic.status==='working' || mosaic.status==='tiling'" :title="!mosaic.tilingResult ? 'Upload an image to enable' : ''" @click="mosaic.tilingResult && exportBuildGuidePDF({ bricks: mosaic.tilingResult!.bricks, width: mosaic.width, height: mosaic.height })">Export PDF</button>
        </div>

        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">
          <div class="w-2/3 max-w-md text-center space-y-3">
            <div>Processing… <span v-if="progress">{{ Math.round(progress) }}%</span></div>
            <div class="h-2 w-full bg-white/10 rounded">
              <div class="h-2 bg-white/60 rounded" :style="{ width: Math.max(2, Math.round(progress)) + '%' }"></div>
            </div>
          </div>
        </div>
        <div v-else-if="grid">
          <template v-if="tab==='2D'">
            <MosaicCanvas :data="grid" :showGrid="showGrid" :showTiles="showPlates" :overlayBricks="mosaic.overlayBricks"/>
          </template>
          <template v-else>
            <ClientOnly>
              <VoxelViewer :bricks="mosaic.tilingResult?.bricks || []" :visibleLayers="mosaic.visibleLayers" :studSize="1"/>
            </ClientOnly>
            <div class="mt-3">
              <LayerSlider :maxLayers="mosaic.height || 1" :visibleLayers="mosaic.visibleLayers" @update:visibleLayers="mosaic.setVisibleLayers"/>
            </div>
          </template>
          <div class="mt-3 text-sm opacity-80 flex items-center gap-4">
            <span v-if="mosaic.status==='tiling'">Coverage: {{ mosaic.coveragePct.toFixed(1) }}%</span>
            <span v-if="mosaic.tilingResult">Bricks: {{ mosaic.tilingResult.bricks.length }}</span>
            <span v-if="mosaic.tilingResult">Est. cost: ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}</span>
            <span v-if="tab==='3D'" class="ml-auto">Visible: {{ mosaic.visibleLayers }} / {{ mosaic.height }}</span>
          </div>
          <p v-if="mosaic.tilingResult" class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
          <!-- Share & buy hooks -->
          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="opacity-70 mr-1">Share:</span>
            <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="shareX">X</button>
            <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="shareFB">Facebook</button>
            <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="shareReddit">Reddit</button>
            <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="copyLink">Copy link</button>
            <div class="grow"></div>
            <button class="px-3 py-1 rounded bg-cta-grad/70 hover:bg-cta-grad text-white" @click="whereToBuy">Where to buy pieces</button>
          </div>
        </div>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
      </section>
      </Transition>
    </div>
  </main>
</template>

