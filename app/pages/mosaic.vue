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
import type { WorkerOut, TiledBrick } from '@/types/mosaic'
import { useMosaicStore } from '@/stores/mosaic'
import { exportBuildGuidePDF } from '@/lib/pdf/buildGuide'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'
import { createWorkerTask } from '@/utils/worker-task'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import { useToasts } from '@/composables/useToasts'
import { imageBitmapToBuffer } from '@/utils/image-to-buffer'
import { copy } from '@/lib/copy'
import StepChips from '@/components/StepChips.vue'
import InfoTip from '@/components/InfoTip.vue'
import InlineStats from '@/components/InlineStats.vue'
import { downloadPartsListCsvSimple } from '@/lib/exporters'
import { generateBrickLinkWantedXML, downloadWantedXml } from '@/lib/bricklink/wantedXml'

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

const target = ref<{w:number,h:number}>({ w: 20, h: 20 })
// If hydrating from a saved project, respect saved dimensions
onMounted(() => {
  if (mosaic.width && mosaic.height) {
    target.value = { w: mosaic.width, h: mosaic.height }
  }
  // Initialize topSurface from URL or localStorage
  try {
    const url = new URL(window.location.href)
    const q = url.searchParams.get('surface')
    if (q === 'tiles' || q === 'plates') {
      mosaic.setTopSurface(q)
    } else {
      const saved = localStorage.getItem('briko.topSurface')
      if (saved === 'tiles' || saved === 'plates') mosaic.setTopSurface(saved)
    }
  } catch {}
})
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
// BrickLink export dialog state
const showBL = ref(false)
const blCondition = ref<'N'|'U'>('N')
const blAddRemarks = ref(true)
// Advanced options gate
const showAdvanced = ref(false)
// Preview quality for first pass
const previewQuality = ref(64) // studs on first progressive run
// Size readouts helpers (rounded to 1 decimal for compact chips)
const fmt1 = (n:number)=> (Math.round(n*10)/10).toFixed(1)
const inchesW = computed(()=> fmt1(target.value.w * 0.315))
const inchesH = computed(()=> fmt1(target.value.h * 0.315))
const cmW = computed(()=> fmt1(target.value.w * 0.8))
const cmH = computed(()=> fmt1(target.value.h * 0.8))

// React to top surface for preview defaults
watch(() => mosaic.settings.topSurface, (mode) => {
  try { showToast('Updating preview…', 'info', 1000) } catch {}
  if (mode === 'tiles') {
    // Hide stud grid for tiles by default
    showGrid.value = false
  }
  // Reflect in URL for persistence
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('surface', mode || 'plates')
    window.history.replaceState({}, '', url.toString())
  } catch {}
})

// Dimension dropdowns and units
const dimOptions = [16, 20, 24, 32, 48, 64, 96, 128]
type UnitsT = 'studs' | 'inches' | 'centimeters'
const units = ref<UnitsT>('studs')

function clamp(n:number, min:number, max:number){ return Math.max(min, Math.min(max, n)) }
function nearestOption(val:number, opts:number[]){
  let best = opts[0], bestD = Math.abs(opts[0] - val)
  for (const o of opts){ const d = Math.abs(o - val); if (d < bestD){ best = o; bestD = d } }
  return best
}
// Keep select values in studs; labels adapt to chosen units
const widthSelStuds = computed<number>({
  get(){ return nearestOption(target.value.w, dimOptions) },
  set(v:number){ const s = clamp(v, 16, 256); target.value.w = s; mosaic.setTargetSize(target.value.w, target.value.h) }
})
const heightSelStuds = computed<number>({
  get(){ return nearestOption(target.value.h, dimOptions) },
  set(v:number){ const s = clamp(v, 16, 256); target.value.h = s; mosaic.setTargetSize(target.value.w, target.value.h) }
})

// Keep the last ImageBitmap to support re-runs without re-decoding
const srcBitmap = ref<ImageBitmap|null>(null)
const mosaicTask = createWorkerTask<WorkerOut>(() => import('@/workers/mosaic.worker?worker').then((m:any) => new m.default()))

// Hover hit-test lookup and handlers
const tileMap = ref<Uint32Array | null>(null)
function buildTileMap(bricks: {x:number;y:number;w:number;h:number}[]){
  const w = mosaic.width, h = mosaic.height
  if (!w || !h) { tileMap.value = null; return }
  const map = new Uint32Array(w * h)
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i]
    const id = i + 1 // 1-based so 0 stays “none”
    for (let dy = 0; dy < b.h; dy++) {
      const row = (b.y + dy) * w + b.x
      for (let dx = 0; dx < b.w; dx++) { map[row + dx] = id }
    }
  }
  tileMap.value = map
}
watch(() => mosaic.tilingResult?.bricks, (bricks?: TiledBrick[]) => {
  if (Array.isArray(bricks) && bricks.length) buildTileMap(bricks)
  else tileMap.value = null
})

// Allowed parts multiselect
const ALL_PARTS = ['2x4','2x3','2x2','1x4','1x3','1x2','1x1'] as const
const selectedParts = ref<string[]>([...ALL_PARTS])
watch(selectedParts, (val: readonly string[])=>{
  mosaic.setAllowedParts(val as any)
  try { showToast(copy.mosaic.toasts.regenerating, 'info', 1500) } catch {}
}, { immediate: true })

async function onFile(file: File) {
  loading.value = true; grid.value = null; progress.value = 0
  mosaic.setUiWorking('manual')
  try {
    try { showToast(copy.mosaic.toasts.generating, 'info', 1500) } catch {}
    srcBitmap.value = await createImageBitmap(file)
    // Save a small original preview data URL for PDF cover (optional)
    try {
      const fr = new FileReader()
      fr.onload = () => { (window as any).__brikoOriginalDataUrl = fr.result as string }
      fr.readAsDataURL(file)
    } catch {}
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
  try {
    try { showToast(copy.mosaic.toasts.generating, 'info', 1200) } catch {}
    await mosaic.runGreedyTiling()
  } finally { mosaic.clearUiWorking() }
}

// Optional preset handler
function choosePreset(w: number, h: number){
  target.value = { w, h }
  mosaic.setTargetSize(w, h)
}

// Snap sliders to nearest allowed value on commit and surface a subtle toast
function snapDim(which: 'w'|'h'){
  const cur = target.value[which]
  const nearest = nearestOption(cur, dimOptions)
  if (cur !== nearest) {
    target.value = { ...target.value, [which]: nearest }
    mosaic.setTargetSize(target.value.w, target.value.h)
    try { showToast('Snapped to nearest supported size', 'info', 1200) } catch {}
  } else {
    // still propagate to store to keep pipeline in sync
    mosaic.setTargetSize(target.value.w, target.value.h)
  }
}

async function saveNow(){ await mosaic.saveProject() }
async function uploadPrev(){ await mosaic.uploadPreview() }

// Exports under preview
async function onDownloadPdf(){
  if (!mosaic.tilingResult) return
  try { showToast('Generating Build Guide…', 'info', 1500) } catch {}
  await exportBuildGuidePDF({ bricks: mosaic.tilingResult.bricks, width: mosaic.width, height: mosaic.height, topSurface: mosaic.settings.topSurface })
}
function onDownloadCsv(){
  if (!mosaic.tilingResult) return
  type SimpleBomRow = { part: string; colorId: number; qty: number }
  const rows = mosaic.tilingResult.bom.map((r: SimpleBomRow) => ({ part: r.part, colorId: r.colorId, qty: r.qty }))
  downloadPartsListCsvSimple(rows, mosaic.settings.topSurface || 'plates')
}

function openBLDialog(){ showBL.value = true }
function closeBLDialog(){ showBL.value = false }
function onDownloadBrickLink(){
  if (!mosaic.tilingResult) return
  try {
    // Map BOM to BrickLink generator input
    const rows = mosaic.tilingResult.bom.map((r: any) => {
      const partKey = ((mosaic.settings.topSurface || 'plates') === 'tiles') ? `tile-${r.part}` : `plate-${r.part}`
      const colorName = legoPalette[r.colorId]?.name
      if (!colorName) { throw new Error(`Unknown color id: ${r.colorId}`) }
      return { partKey, colorKey: colorName, qty: r.qty }
    })
    const remarks = blAddRemarks.value ? `Briko • Mosaic ${mosaic.width}×${mosaic.height}` : undefined
    const xml = generateBrickLinkWantedXML(rows, { condition: blCondition.value, remarks })
    downloadWantedXml(xml, `briko-wanted-list-${mosaic.settings.topSurface || 'plates'}-${Date.now()}.xml`)
    try { showToast('BrickLink file ready. Upload it at Wanted → Upload.', 'success', 2000) } catch {}
  } catch (e: any) {
    const msg = e?.message ? String(e.message) : 'Failed to generate BrickLink XML'
    try { showToast(msg, 'error', 4000) } catch {}
  } finally {
    closeBLDialog()
  }
}

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

// Jump to matching BOM row when requested by canvas tooltip
function onViewBom(part: string, colorId: number){
  try {
    const id = `bom-${part}-${colorId}`
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2','ring-mint/60','rounded-md')
      setTimeout(() => el.classList.remove('ring-2','ring-mint/60'), 1200)
    }
  } catch {}
}

// Typed event proxy for template to avoid implicit any on $event
function onViewBomEvt(e: { part: string; colorId: number }){
  onViewBom(e.part, e.colorId)
}

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
  <main class="mx-auto max-w-7xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">{{ copy.mosaic.title }}</h1>
    <p class="opacity-80">{{ copy.mosaic.subtitle }}</p>
    <StepChips :steps="copy.mosaic.steps" />

    <div class="mt-6 grid lg:grid-cols-[460px,1fr] gap-6 items-start">
      <!-- left column -->
      <div class="lg:col-span-1">
        <aside class="space-y-6">
          <!-- A) Sticky parent contains ONLY the controls -->
          <div class="sticky-parent relative">
            <div class="lg:sticky lg:top-[calc(var(--app-header-h,64px)+12px)] z-0" aria-label="Mosaic parameters">
            <Transition appear enter-active-class="transition ease-out duration-600"
                        enter-from-class="opacity-0 translate-y-2"
                        enter-to-class="opacity-100 translate-y-0">
        <div class="z-0 rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 shadow-soft-card transition space-y-3 hover:shadow-mint-glow/30 hover:-translate-y-0.5">
          <!-- Upload embedded -->
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Upload</label>
            <MosaicUploader embedded @file="onFile" />
          </div>
          <div class="flex items-center gap-2">
            <h3 class="text-white text-base font-semibold">Output size</h3>
            <InfoTip label="About output size">
              Bigger sizes use more bricks and show more detail.
            </InfoTip>
            <div class="ml-auto text-xs bg-white/10 rounded-md overflow-hidden">
              <button :class="['px-2 py-1', !showAdvanced ? 'bg-white/20' : '']" @click="showAdvanced=false">Simple</button>
              <button :class="['px-2 py-1', showAdvanced ? 'bg-white/20' : '']" @click="showAdvanced=true">Advanced</button>
            </div>
          </div>
          <!-- Optional preset size chips -->
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="preset in [[16,16],[20,20],[32,32],[48,48],[64,64]]" :key="(preset as any).join('x')"
                    class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-mint/40"
                    @click="choosePreset((preset as any)[0], (preset as any)[1])">
              {{ (preset as any)[0] }}×{{ (preset as any)[1] }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-5 text-sm">
            <label>Width
              <input type="range" min="16" max="256" step="1" v-model.number="target.w" @change="snapDim('w')" class="range-mint">
            </label>
            <label>Height
              <input type="range" min="16" max="256" step="1" v-model.number="target.h" @change="snapDim('h')" class="range-mint">
            </label>
          </div>
          <InlineStats :items="[
            `${target.w}×${target.h} studs`,
            `${inchesW}×${inchesH} in`,
            `${cmW}×${cmH} cm`
          ]" />

          <!-- Precise inputs -->
          <div class="h-px bg-white/5 my-3"></div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white/80">What size mosaic would you like?</h4>
            </div>
            <p class="mt-1 text-xs text-white/60">Pick exact dimensions, or use the sliders above.</p>
            <div class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-white/60 mb-1">Width</label>
                <select v-model.number="widthSelStuds" class="select-mint" :aria-describedby="'desc-width'">
                  <option v-for="n in dimOptions" :key="'w'+n" :value="n">{{ units==='studs' ? n : (units==='inches' ? fmt1(n*0.315) : fmt1(n*0.8)) }}</option>
                </select>
                <span id="desc-width" class="sr-only">Exact mosaic width. Matches the sliders above.</span>
              </div>
              <div>
                <label class="block text-xs text-white/60 mb-1">Height</label>
                <select v-model.number="heightSelStuds" class="select-mint" :aria-describedby="'desc-height'">
                  <option v-for="n in dimOptions" :key="'h'+n" :value="n">{{ units==='studs' ? n : (units==='inches' ? fmt1(n*0.315) : fmt1(n*0.8)) }}</option>
                </select>
                <span id="desc-height" class="sr-only">Exact mosaic height. Matches the sliders above.</span>
              </div>
              <div>
                <label class="block text-xs text-white/60 mb-1">Units</label>
                <select v-model="units" class="select-mint" :aria-describedby="'desc-units'">
                  <option value="studs">Studs</option>
                  <option value="inches">Inches</option>
                  <option value="centimeters">Centimeters</option>
                </select>
                <span id="desc-units" class="sr-only">Change display units only; brick count stays the same.</span>
              </div>
            </div>
          </div>

          <div class="mt-3" v-if="showAdvanced">
            <label class="block text-sm" title="Pieces you want to build with">Allowed parts</label>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <label v-for="p in ALL_PARTS" :key="p" class="inline-flex items-center gap-2">
                <input type="checkbox" :value="p" v-model="selectedParts"> {{ p.replace('x','×') }}
              </label>
            </div>
          </div>
          <div class="mt-3" v-if="showAdvanced">
            <div class="flex items-center gap-2">
              <label class="block text-sm">Top surface</label>
              <InfoTip label="About top surface">
                <div>
                  Studded = plates (classic LEGO look).<br/>
                  Smooth = tiles (poster finish).
                </div>
              </InfoTip>
              <div class="grow"></div>
            </div>
            <div class="mt-2 inline-flex rounded-lg overflow-hidden border border-white/10">
              <button :class="['px-3 py-1.5 text-sm', mosaic.settings.topSurface==='plates' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white']" @click="mosaic.setTopSurface('plates')">Studded (plates)</button>
              <button :class="['px-3 py-1.5 text-sm', mosaic.settings.topSurface==='tiles' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white']" @click="mosaic.setTopSurface('tiles')">Smooth (tiles)</button>
            </div>
          </div>
          <div class="mt-3" v-if="showAdvanced">
            <label class="block text-sm">Orientation</label>
            <div class="flex items-center mt-1">
              <div class="min-w-[160px] max-w-[220px]">
                <select v-model="mosaic.settings.snapOrientation" class="select-mint">
                  <option value="both">Both</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <label class="ml-3 flex items-center gap-1 select-none">
                <input type="checkbox" v-model="showGrid" class="accent-mint" />
                <span>Show stud grid</span>
              </label>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm mt-2" v-if="showAdvanced">
            <input type="checkbox" v-model="useDither"> Smoother shading (dithering)
          </label>
          <div class="mt-4 text-sm">
            <div class="flex items-center gap-2">
              <label class="block text-sm text-white/80">Preview quality</label>
              <InfoTip label="About preview quality">
                Faster preview = fewer bricks. Detail = more bricks, sharper look.
              </InfoTip>
            </div>
            <select v-model.number="previewQuality" class="select-mint">
              <option :value="32">Fast (32×32)</option>
              <option :value="64">Balanced (64×64)</option>
              <option :value="96">Sharper (96×96)</option>
              <option :value="128">High (128×128)</option>
            </select>
          </div>
          <div class="h-px bg-white/5 my-3"></div>
          <div class="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <button class="btn-mint w-full" :disabled="!grid || mosaic.status==='tiling'" :title="!grid ? 'Upload an image to enable' : ''" @click="onGenerate">Generate Mosaic</button>
            <button class="rounded-2xl border border-white/10 px-4 py-2 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.currentProjectId" :title="!mosaic.currentProjectId ? 'Create or open a project to enable' : ''" @click="saveNow">Save Project</button>
            <button class="rounded-2xl border border-white/10 px-4 py-2 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto" :disabled="!mosaic.currentProjectId || !mosaic.tilingResult" :title="(!mosaic.currentProjectId || !mosaic.tilingResult) ? 'Generate and save a project first' : ''" @click="uploadPrev">Upload Preview</button>
          </div>
        </div>
            </Transition>
            </div>
          </div>

          <!-- B) Parts list (NOT inside the sticky parent) -->
          <div v-if="mosaic.tilingResult" class="relative z-10 rounded-2xl bg-white/5 border border-white/10 p-5 shadow-soft-card">
            <header class="mb-3 flex items-center justify-between">
              <h3 class="text-white font-semibold">Parts list</h3>
              <div class="text-sm text-white/60">Est. cost: ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}</div>
            </header>

            <!-- Export buttons belong here so they scroll with the list -->
            <div class="mb-3 flex flex-wrap gap-3">
            <button class="rounded-xl border border-white/10 px-3 py-2 text-white/80 hover:border-mint/40 transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="mosaic.exportPNG">Export PNG</button>
            <button class="rounded-xl border border-white/10 px-3 py-2 text-white/80 hover:border-mint/40 transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="mosaic.tilingResult && exportBuildGuidePDF({ bricks: mosaic.tilingResult!.bricks, width: mosaic.width, height: mosaic.height, topSurface: mosaic.settings.topSurface })">Export PDF</button>
            <button class="rounded-xl border border-white/10 px-3 py-2 text-white/80 hover:border-mint/40 transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="mosaic.exportCSV">Export CSV</button>
          </div>

            <!-- BOM items -->
            <ul class="divide-y divide-white/5 text-sm">
              <li v-for="row in mosaic.tilingResult.bom" :key="row.part + '-' + row.colorId" :id="'bom-' + row.part + '-' + row.colorId" class="py-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="inline-block w-3 h-3 rounded-sm ring-1 ring-white/20" :style="{ backgroundColor: (legoPalette[row.colorId]?.hex || '#ccc') }"></span>
                  <span class="opacity-80">{{ legoPalette[row.colorId]?.name || ('Color '+row.colorId) }} · {{ (mosaic.settings.topSurface==='tiles' ? 'Tile' : 'Plate') }} {{ row.part.replace('x','×') }}</span>
                </div>
                <div class="text-white/70 text-sm">{{ row.qty }} pcs</div>
              </li>
            </ul>
            <p class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
          </div>
        </aside>

      </div>
      

      <!-- right preview with dropzone -->
      <Transition appear enter-active-class="transition ease-out duration-700 delay-150"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0">
      <section id="mosaic-preview-capture"
        class="relative rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 shadow-soft-card transition hover:-translate-y-0.5"
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
          <label v-if="tab==='2D'" class="ml-auto inline-flex items-center gap-2 text-white/80" :title="copy.mosaic.controls.showPlateOutlinesHelp">
            <input type="checkbox" class="accent-mint" v-model="showPlates" />
            <span>{{ copy.mosaic.controls.showPlateOutlines }}</span>
          </label>
          <div v-if="mosaic.status==='error'" class="ml-2 text-xs text-red-300 bg-red-500/10 px-3 py-1.5 rounded-full">
            Generation failed — {{ mosaic.errorMsg }}
          </div>
          <button class="rounded-xl border border-white/10 px-3 py-1.5 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.tilingResult || mosaic.status==='working' || mosaic.status==='tiling'" :title="!mosaic.tilingResult ? 'Upload an image to enable' : ''" @click="mosaic.tilingResult && exportBuildGuidePDF({ bricks: mosaic.tilingResult!.bricks, width: mosaic.width, height: mosaic.height, topSurface: mosaic.settings.topSurface })">Export PDF</button>
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
          <Transition mode="out-in"
                      enter-active-class="transition ease-out duration-300"
                      enter-from-class="opacity-0 translate-y-1"
                      enter-to-class="opacity-100 translate-y-0">
            <div :key="tab">
              <template v-if="tab==='2D'">
                <MosaicCanvas
                  :data="grid"
                  :showGrid="showGrid"
                  :showTiles="showPlates"
                  :overlayBricks="mosaic.overlayBricks"
                  :tileMap="tileMap"
                  :bricks="mosaic.tilingResult?.bricks || null"
                  :bomRows="mosaic.tilingResult?.bom || null"
                  :surface="(mosaic.settings.topSurface || 'plates') as any"
                  @view-bom="onViewBomEvt"
                />
              </template>
              <template v-else>
                <ClientOnly>
                  <VoxelViewer :bricks="mosaic.tilingResult?.bricks || []" :visibleLayers="mosaic.visibleLayers" :studSize="1" :surface="(mosaic.settings.topSurface || 'plates') as any"/>
                </ClientOnly>
                <div class="mt-3">
                  <LayerSlider :maxLayers="mosaic.height || 1" :visibleLayers="mosaic.visibleLayers" @update:visibleLayers="mosaic.setVisibleLayers" :title="copy.builder3d.controls.layerSliderHelp"/>
                </div>
              </template>
            </div>
          </Transition>
          <!-- Export actions under preview -->
          <div class="mt-4 relative">
            <div class="flex flex-wrap gap-3">
              <button class="rounded-2xl border border-white/10 px-4 py-2 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" @click="onDownloadPdf">Download Build Guide (PDF)</button>
              <button class="rounded-2xl border border-white/10 px-4 py-2 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" @click="onDownloadCsv">Download Parts List (CSV)</button>
              <button class="rounded-2xl border border-white/10 px-4 py-2 text-white/80 hover:border-mint/40 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" @click="openBLDialog" :title="'Downloads a BrickLink Wanted List you can upload at BrickLink → Wanted → Upload.'">Export for BrickLink (.xml)</button>
            </div>

            <!-- BrickLink export small dialog -->
            <div v-if="showBL" class="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-white/10 bg-black/70 p-4 shadow-soft-card">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium">BrickLink Export</div>
                <button class="text-white/60 hover:text-white" @click="closeBLDialog">✕</button>
              </div>
              <div class="space-y-3 text-sm">
                <div>
                  <div class="text-white/80 mb-1">Condition</div>
                  <label class="mr-3 inline-flex items-center gap-2"><input type="radio" value="N" v-model="blCondition"> New</label>
                  <label class="inline-flex items-center gap-2"><input type="radio" value="U" v-model="blCondition"> Used</label>
                </div>
                <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="blAddRemarks"> Add remarks “Briko • Mosaic”</label>
                <div class="flex justify-end gap-2 pt-2">
                  <button class="rounded-xl border border-white/10 px-3 py-1.5 text-white/80 hover:text-white hover:border-mint/40" @click="closeBLDialog">Cancel</button>
                  <button class="rounded-xl border border-white/10 px-3 py-1.5 text-white bg-mint/20 hover:border-mint/50" @click="onDownloadBrickLink">Export XML</button>
                </div>
              </div>
            </div>
          </div>
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
        <div v-else class="h-[480px] grid place-items-center opacity-60">{{ copy.mosaic.emptyState }}</div>
      </section>
      </Transition>
    </div>
  </main>
</template>

