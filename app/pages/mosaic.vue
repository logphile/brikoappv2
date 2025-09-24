<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { useHead, useNuxtApp } from 'nuxt/app'
import { useRemixLoader } from '@/composables/useRemixLoader'
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
import { prepareBuildGuidePDF } from '@/lib/pdf/buildGuideAdapter'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'
import { createWorkerTask } from '@/utils/worker-task'
import { webPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonld'
import { useToasts } from '@/composables/useToasts'
import EmptyMosaicPlaceholder from '@/components/ui/EmptyMosaicPlaceholder.vue'
import { imageBitmapToBuffer } from '@/utils/image-to-buffer'
import { copy } from '@/lib/copy'
import StepBadge from '@/components/StepBadge.vue'
import InfoTip from '@/components/InfoTip.vue'
import InlineStats from '@/components/InlineStats.vue'
import { downloadPartsListCsvSimple, downloadPng } from '@/lib/exporters'
import { generateBrickLinkWantedXML, downloadWantedXml } from '@/lib/bricklink/wantedXml'
import { useProjects } from '@/composables/useProjects'
import { useMosaicify } from '@/composables/useMosaicify'
import { suggestStuds } from '@/composables/useAutoSize'
import MosaicActions from '@/components/MosaicActions.vue'

const mosaic = useMosaicStore()
const route = useRoute()
const { show: showToast, dismiss: dismissToast, toasts } = useToasts()
const { loadingFromSrc, loadInto } = useRemixLoader()

// Quick guide steps + auto-highlighting while scrolling
const stepsGuide = [
  { id: 'step-1', title: 'Upload photo' },
  { id: 'step-2', title: 'Tune mosaic' },
  { id: 'step-3', title: 'Build guide' },
  { id: 'step-4', title: 'Buy parts' },
]
// Gate highlighting: only advance after prerequisites are met
const guideGenerated = ref(false)
const activeStepIndex = computed(() => {
  // 0: Upload photo; 1: Tune mosaic; 2: Build guide; 3: Buy parts
  if (!grid.value) return 0
  // after image processed, allow Step 2
  if (!guideGenerated.value) return 1
  // once a guide has been generated in this session, allow Step 3 and Step 4
  return 3
})
// Track hydration completion to suppress initial toasts
const didMount = ref(false)

// SEO
useHead({
  title: 'Photo to Bricks',
  meta: [
    { name: 'description', content: 'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.' },
    { property: 'og:title', content: 'Photo to Bricks | Briko' },
    { property: 'og:description', content: 'Transform your photos into LEGO-style mosaics with Briko’s instant brick tiler. Export parts list and cost estimate.' },
    { property: 'og:url', content: 'https://briko.app/mosaic' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Photo to Bricks | Briko' },
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

// UI button enable/disable states (for MosaicActions)
const previewReady = computed(() => !!grid.value && mosaic.status !== 'tiling')
const mosaicReady = computed(() => !!mosaic.tilingResult)
const projectSaved = computed(() => !!galleryProjectId.value)
const isWorking = computed(() => !!loading.value || mosaic.status === 'working' || mosaic.status === 'tiling' || !!publishing.value)

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
  // Sweep any SSR-hydrated stale toasts (e.g., 'Updating preview…')
  try {
    toasts.value
      .filter(t => /Updating preview…|Updating preview/.test(String(t.message)))
      .forEach(t => dismissToast(t.id))
  } catch {}
  didMount.value = true
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
// Blob URL for uploaded image to show as a fallback before mosaic is ready
const sourceImgUrl = ref<string | null>(null)
// Preset mode for quick preview (auto chooses line-art vs. photo)
const mode = ref<'auto'|'line-art'|'photo'>('auto')
const resolvedMode = ref<'auto'|'line-art'|'photo'>('auto')
// Briko’d preview blob for upload (WebP)
const previewBlob = ref<Blob | null>(null)
// Keep original src File for deriving a public, downscaled original preview on publish
const srcFile = ref<File | null>(null)
const { mosaicifyFromFile, analyzeFile } = useMosaicify()
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

// Community Gallery publishing state
const galleryProjectId = ref<string | null>(null)
const publishing = ref(false)
async function publishToGallery(){
  if (!mosaic.tilingResult) return
  const { $supabase } = useNuxtApp() as any
  const { createProject } = useProjects()
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  publishing.value = true
  try {
    const title = `Mosaic ${mosaic.width}×${mosaic.height}`
    const bricks = mosaic.tilingResult.bricks?.length || (mosaic.width * mosaic.height)
    const cost_est = Number(mosaic.tilingResult.estTotalCost || 0)
    const rec = await createProject({
      title,
      kind: 'mosaic',
      width: mosaic.width || 0,
      height: mosaic.height || 0,
      palette_id: 'briko-v1',
      previewBlob: previewBlob.value || undefined,
      sourceFile: srcFile.value || undefined,
      mode: (resolvedMode.value as any) || mode.value,
      bricks_est: bricks,
      cost_est_usd: cost_est,
      makePublic: false,
    })
    galleryProjectId.value = rec.id
    try { showToast('Saved to your Gallery (private)', 'success', 2200) } catch {}
  } catch (e) {
    console.error(e); try { showToast('Publish failed', 'error', 2800) } catch {}
  } finally { publishing.value = false }
}

async function makePublic(){
  if (!galleryProjectId.value) { try { showToast('Save to Gallery first', 'info', 1600) } catch {}; return }
  const { $supabase } = useNuxtApp() as any
  const { makePublic } = useProjects()
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  try { await makePublic(galleryProjectId.value, user.id); try { showToast('Your project is public!', 'success', 2200) } catch {} }
  catch(e){ console.warn(e); try { showToast('Failed to publish', 'error', 2200) } catch {} }
}

// React to top surface for preview defaults
watch(() => mosaic.settings.topSurface, (mode) => {
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
  if (didMount.value && typeof window !== 'undefined') {
    try { showToast(copy.mosaic.toasts.regenerating, 'info', 1500) } catch {}
  }
}, { immediate: true })

async function onFile(file: File) {
  loading.value = true; grid.value = null; progress.value = 0
  mosaic.setUiWorking('manual')
  try {
    try { showToast(copy.mosaic.toasts.generating, 'info', 1500) } catch {}
    // Update fallback image URL for the preview window
    try { if (sourceImgUrl.value) URL.revokeObjectURL(sourceImgUrl.value) } catch {}
    sourceImgUrl.value = URL.createObjectURL(file)
    // Analyze quickly in worker to suggest size/aspect and preset
    try {
      const a = await analyzeFile(file)
      mode.value = a.mode as any
      const s = suggestStuds(a.width, a.height, { meanSat: a.meanSat, edgeDensity: a.edgeDensity })
      target.value = { w: s.w, h: s.h }
      mosaic.setTargetSize(s.w, s.h)
    } catch (e) { console.warn('[analyze] failed', e) }
    // Decode to ImageBitmap for the quantization/tiling pipeline
    srcBitmap.value = await createImageBitmap(file)
    srcFile.value = file
    // Save a small original preview data URL for PDF cover (optional)
    try {
      const fr = new FileReader()
      fr.onload = () => { (window as any).__brikoOriginalDataUrl = fr.result as string }
      fr.readAsDataURL(file)
    } catch {}
    // Kick off fast Briko’d preview (WebP) using lightweight pipeline (bytes → worker)
    try {
      const { blob, mode: resolved } = await mosaicifyFromFile(file, { w: target.value.w, h: target.value.h, paletteId: 'briko-v1', mode: mode.value })
      mode.value = (resolved as any) || mode.value
      resolvedMode.value = (resolved as any) || mode.value
      previewBlob.value = blob
      // Replace fallback URL with processed preview URL after worker finishes
      try { if (sourceImgUrl.value) URL.revokeObjectURL(sourceImgUrl.value) } catch {}
      sourceImgUrl.value = URL.createObjectURL(blob)
      try { showToast(`Auto: ${resolvedMode.value} • ${target.value.w}×${target.value.h} studs`, 'success', 1600) } catch {}
    } catch (e) { console.warn('[mosaicify] preview failed', e) }

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

// Kick off remix load from URL query at mount and on changes (shared loader)
onMounted(() => {
  const src = route.query.src as string | undefined
  if (src) loadInto(onFile, decodeURIComponent(src))
})
watch(() => route.query.src, (src) => {
  if (typeof src === 'string' && src) loadInto(onFile, decodeURIComponent(src))
})

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

// Save & Publish using new createProject helper (uploads WebP preview first)
async function saveAndPublish(){
  try {
    const { createProject } = useProjects()
    const rec = await createProject({
      title: `Mosaic ${target.value.w}×${target.value.h}`,
      kind: 'mosaic',
      width: target.value.w,
      height: target.value.h,
      palette_id: 'briko-v1',
      previewBlob: previewBlob.value || undefined,
      sourceFile: srcFile.value || undefined,
      mode: (resolvedMode.value as any) || mode.value,
      bricks_est: mosaic.tilingResult?.bricks?.length || (target.value.w * target.value.h),
      cost_est_usd: mosaic.tilingResult?.estTotalCost || 0,
      makePublic: true,
    })
    galleryProjectId.value = rec.id
    try { showToast('Project published to Gallery', 'success', 2200) } catch {}
  } catch (e:any) {
    console.error(e)
    try { showToast('Save failed', 'error', 2200) } catch {}
  }
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
  // Bullet-proof export with persistent toast and robust save
  const toastId = showToast('Generating build guide…', 'info', 0)
  try {
    const pdf = await prepareBuildGuidePDF({
      bricks: mosaic.tilingResult.bricks,
      width: mosaic.width,
      height: mosaic.height,
      topSurface: mosaic.settings.topSurface
    })
    try {
      pdf.save(`briko-build-guide-${Date.now()}.pdf`)
    } catch {
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `briko-build-guide-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
    showToast('Your PDF is ready!', 'success', 2500)
    guideGenerated.value = true
  } catch (err: any) {
    console.error('[BuildGuide] generation failed:', err)
    showToast('Something went wrong. Please try again.', 'error', 3000)
  } finally {
    dismissToast(toastId)
  }
}
function onDownloadCsv(){
  if (!mosaic.tilingResult) return
  type SimpleBomRow = { part: string; colorId: number; qty: number }
  const rows = mosaic.tilingResult.bom.map((r: SimpleBomRow) => ({ part: r.part, colorId: r.colorId, qty: r.qty }))
  const id = showToast('Generating CSV…', 'info', 0)
  try {
    downloadPartsListCsvSimple(rows, mosaic.settings.topSurface || 'plates')
    showToast('Your CSV is ready!', 'success', 2000)
  } catch (e) {
    console.error('[CSV] export failed', e)
    showToast('Something went wrong. Please try again.', 'error', 3000)
  } finally {
    dismissToast(id)
  }
}

async function onDownloadPng(){
  if (!mosaic.canExport) return
  const id = showToast('Generating PNG…', 'info', 0)
  try {
    await downloadPng('briko-mosaic.png')
    showToast('PNG ready!', 'success', 2000)
  } catch (e) {
    console.error('[PNG] export failed', e)
    showToast('Something went wrong. Please try again.', 'error', 3000)
  } finally {
    dismissToast(id)
  }
}

function openBLDialog(){ showBL.value = true }
function closeBLDialog(){ showBL.value = false }
function onDownloadBrickLink(){
  if (!mosaic.tilingResult) return
  const id = showToast('Generating BrickLink XML…', 'info', 0)
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
    try { showToast('Your BrickLink XML is ready!', 'success', 2000) } catch {}
  } catch (e: any) {
    console.error('[BrickLink] export failed', e)
    try { showToast('Something went wrong. Please try again.', 'error', 3000) } catch {}
  } finally {
    closeBLDialog()
    dismissToast(id)
  }
}

// Share helpers
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

// Lightweight analytics for Buy CTAs (no-op if gtag missing)
function onBuyClickHeader(){ try { (window as any)?.gtag?.('event', 'click_buy_parts', { location: 'parts_list_header' }) } catch {} }
function onBuyClickSticky(){ try { (window as any)?.gtag?.('event', 'click_buy_parts', { location: 'parts_list_sticky_mobile' }) } catch {} }

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
onBeforeUnmount(()=>{
  window.removeEventListener('dragover', preventWindowDrop);
  window.removeEventListener('drop', preventWindowDrop);
  if (sourceImgUrl.value) { try { URL.revokeObjectURL(sourceImgUrl.value) } catch {} }
  mosaicTask.cancel();
  mosaic.cancelTiling()
})

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
  <main class="mx-auto max-w-7xl px-6 py-10 text-[#343434]">
    <h1 class="text-3xl font-bold">{{ copy.mosaic.title }}</h1>
    <p class="opacity-80">{{ copy.mosaic.subtitle }}</p>
    <nav aria-label="Quick guide" class="mt-2 flex items-center gap-4 flex-wrap">
      <a v-for="(s, i) in stepsGuide" :key="s.id" :href="'#' + s.id" class="flex items-center gap-2">
        <StepBadge :n="i+1" :active="i <= activeStepIndex" />
        <span class="material-symbols-rounded text-[18px] text-pink-500" aria-hidden="true">
          {{ i === 0 ? 'file_upload' : (i === 1 ? 'tune' : (i === 2 ? 'format_list_numbered' : 'shopping_cart')) }}
        </span>
        <span :class="['text-sm', (i <= activeStepIndex) ? 'border-b-2 border-pink-500 text-[#343434]' : 'text-[#343434]/70']">{{ s.title }}</span>
      </a>
    </nav>

    <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(360px,420px)_1fr] items-start">
      <!-- left column -->
      <div class="lg:col-span-1">
        <aside class="space-y-6">
          <!-- A) Sticky parent contains ONLY the controls -->
          <div class="sticky-parent relative">
            <div class="lg:sticky lg:top-24 z-0" aria-label="Mosaic parameters">
            <Transition appear enter-active-class="transition ease-out duration-600"
                        enter-from-class="opacity-0 translate-y-2"
                        enter-to-class="opacity-100 translate-y-0">
        <div class="z-0 card-glass p-5 space-y-3">
          <!-- Step 1: Upload -->
          <section :id="stepsGuide[0].id" class="scroll-mt-28 pt-2">
            <div class="flex items-center gap-3 mb-1">
              <StepBadge :n="1" size="lg" :active="activeStepIndex >= 0" />
              <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">file_upload</span>
              </div>
              <h2 class="text-base font-semibold">Upload your photo</h2>
            </div>

          <!-- Presets row: Auto / Line Art / Photo Pop -->
          <div class="mt-3">
            <label class="block text-sm font-medium text-[#343434]/80 mb-1">Preset</label>
            <div class="flex gap-2 flex-wrap">
              <button :class="['px-3 py-1 rounded-full text-sm border', mode==='auto' ? 'border-pink-500 bg-white/10 text-[#343434]' : 'border-white/10 bg-white/5 text-[#343434]/80']" @click="mode='auto'">Auto</button>
              <button :class="['px-3 py-1 rounded-full text-sm border', mode==='line-art' ? 'border-pink-500 bg-white/10 text-[#343434]' : 'border-white/10 bg-white/5 text-[#343434]/80']" @click="mode='line-art'">Line Art</button>
              <button :class="['px-3 py-1 rounded-full text-sm border', mode==='photo' ? 'border-pink-500 bg-white/10 text-[#343434]' : 'border-white/10 bg-white/5 text-[#343434]/80']" @click="mode='photo'">Photo Pop</button>
            </div>
          </div>
          </section>
          <!-- Upload embedded -->
          <div>
            <label class="block text-sm font-medium text-[#343434]/80 mb-2">Upload</label>
            <MosaicUploader embedded @file="onFile" />
          </div>
          
          <!-- Step 2: Tune mosaic -->
          <section :id="stepsGuide[1].id" class="scroll-mt-28 pt-6">
            <div class="flex items-center gap-3 mb-1">
              <StepBadge :n="2" size="lg" :active="activeStepIndex >= 1" />
              <div class="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-white/70">
                <span class="material-symbols-rounded text-[20px] text-pink-500" aria-hidden="true">tune</span>
              </div>
              <h2 class="text-base font-semibold">Tune mosaic</h2>
            </div>
          </section>
          <div class="flex items-center gap-2">
            <h3 class="text-[#343434] text-base font-semibold">Output size</h3>
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
                    class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#343434]/80 hover:border-pink-500/40"
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
              <h4 class="text-sm font-medium text-[#343434]/80">What size mosaic would you like?</h4>
            </div>
            <p class="mt-1 text-xs text-[#343434]/60">Pick exact dimensions, or use the sliders above.</p>
            <div class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-[#343434]/60 mb-1">Width</label>
                <select v-model.number="widthSelStuds" class="select-mint" :aria-describedby="'desc-width'">
                  <option v-for="n in dimOptions" :key="'w'+n" :value="n">{{ units==='studs' ? n : (units==='inches' ? fmt1(n*0.315) : fmt1(n*0.8)) }}</option>
                </select>
                <span id="desc-width" class="sr-only">Exact mosaic width. Matches the sliders above.</span>
              </div>
              <div>
                <label class="block text-xs text-[#343434]/60 mb-1">Height</label>
                <select v-model.number="heightSelStuds" class="select-mint" :aria-describedby="'desc-height'">
                  <option v-for="n in dimOptions" :key="'h'+n" :value="n">{{ units==='studs' ? n : (units==='inches' ? fmt1(n*0.315) : fmt1(n*0.8)) }}</option>
                </select>
                <span id="desc-height" class="sr-only">Exact mosaic height. Matches the sliders above.</span>
              </div>
              <div>
                <label class="block text-xs text-[#343434]/60 mb-1">Units</label>
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
                <input type="checkbox" v-model="showGrid" class="accent-pink-500" />
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
          <div class="mt-4">
            <MosaicActions
              :can-generate="previewReady"
              :can-save="mosaicReady"
              :can-publish="projectSaved"
              :busy="isWorking"
              @generate="onGenerate"
              @savePrivate="publishToGallery"
              @saveAndPublish="saveAndPublish"
              @publish="makePublic"
              @uploadPreview="uploadPrev"
              @saveProjectLegacy="saveNow"
            />
          </div>
        </div>
            </Transition>
            </div>
          </div>

          <!-- B) Parts list (NOT inside the sticky parent) -->
          <!-- Step 4: Buy parts (BOM & exports) -->
          <section :id="stepsGuide[3].id" class="scroll-mt-28 pt-8">
            <div class="flex items-center gap-3 mb-3">
              <StepBadge :n="4" size="lg" :active="activeStepIndex >= 3" />
              <h2 class="text-base font-semibold">Buy parts</h2>
            </div>
          </section>
          <div v-if="mosaic.tilingResult" class="relative z-10 card-glass p-5">
            <!-- Header -->
            <header class="px-4 pt-4 space-y-3">
              <!-- Row 1: title + cost -->
              <div class="flex items-baseline gap-3">
                <h4 class="font-semibold">Parts list</h4>
                <span class="text-sm text-white/70">Est. cost: ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}</span>
              </div>

              <!-- Row 2: export buttons -->
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn-mint h-10 px-3 rounded-lg whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!mosaic.canExport"
                  :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''"
                  @click="onDownloadPng"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 5h16v14H4z"/>
                    <path d="M8 14l2.5-3 2 2.5L15 11l3 3"/>
                  </svg>
                  Export PNG
                </button>

                <button
                  class="btn-mint h-10 px-3 rounded-lg whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!mosaic.canExport"
                  :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''"
                  @click="onDownloadPdf"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 19h16" stroke-linecap="round"/>
                  </svg>
                  Export PDF
                </button>

                <button
                  class="btn-soft h-10 px-3 rounded-lg whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!mosaic.canExport"
                  :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''"
                  @click="mosaic.exportCSV"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
                  </svg>
                  Export CSV
                </button>
              </div>

              <!-- Row 3: buy CTA -->
              <div>
                <a
                  href="https://briko.app/help/buy-bricks"
                  target="_blank" rel="noopener"
                  class="btn-mint h-11 px-4 rounded-xl inline-flex items-center gap-2 justify-center w-full sm:w-auto"
                  aria-label="Where to buy pieces"
                  @click="onBuyClickHeader"
                >
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M6 7h12l-1 12H7L6 7Z"/>
                    <path d="M9 10V8a3 3 0 0 1 6 0v2"/>
                  </svg>
                  <span>Where to buy pieces</span>
                </a>
              </div>
            </header>

            <!-- BOM list + mobile sticky CTA wrapper -->
            <div class="relative -mx-4 mt-3 px-4">
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

              <!-- Mobile-only sticky CTA -->
              <div class="sticky bottom-0 bg-gradient-to-t from-[#0B0F16]/90 to-transparent pt-3 pb-3 md:hidden">
                <div class="flex justify-end">
                  <a
                    href="https://briko.app/help/buy-bricks"
                    target="_blank" rel="noopener"
                    class="btn-mint h-11 px-4 rounded-xl inline-flex items-center gap-2"
                    aria-label="Where to buy pieces"
                    @click="onBuyClickSticky"
                  >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M6 7h12l-1 12H7L6 7Z"/>
                      <path d="M9 10V8a3 3 0 0 1 6 0v2"/>
                    </svg>
                    <span>Where to buy pieces</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
      

      <!-- right preview with dropzone -->
      <Transition appear enter-active-class="transition ease-out duration-700 delay-150"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0">
      <!-- Step 3: Build guide (preview + export) -->
      <section :id="stepsGuide[2].id" class="scroll-mt-28">
        <ClientOnly>
        <div class="card-glass overflow-hidden">
          <!-- Unified header -->
          <div class="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3">
            <StepBadge :n="3" :active="activeStepIndex >= 2" />
            <h3 class="text-white/90 font-semibold">Build guide</h3>
            <div class="ml-2 flex items-center gap-2 text-sm">
              <button :class="['px-3 py-1 rounded-md', tab==='2D' ? 'text-white border-b-2 border-pink-500' : 'text-white/70']" @click="tab='2D'">2D Mosaic</button>
              <button :class="['px-3 py-1 rounded-md', tab==='3D' ? 'text-white border-b-2 border-pink-500' : 'text-white/70']" @click="tab='3D'">3D Preview</button>
            </div>
            <div class="ml-auto flex items-center gap-3">
              <label v-if="tab==='2D'" class="inline-flex items-center gap-2 text-xs text-white/80" :title="copy.mosaic.controls.showPlateOutlinesHelp">
                <input type="checkbox" class="accent-pink-500" v-model="showPlates" />
                <span>{{ copy.mosaic.controls.showPlateOutlines }}</span>
              </label>
              <div v-if="mosaic.status==='error'" class="text-xs text-red-300 bg-red-500/10 px-3 py-1.5 rounded-full">
                Generation failed — {{ mosaic.errorMsg }}
              </div>
            </div>
          </div>

          <!-- Card body -->
          <div id="mosaic-preview-capture"
            class="relative p-5 transition hover:-translate-y-0.0"
            :aria-busy="mosaic.status==='working' || mosaic.status==='tiling'"
            @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop"
          >
          <RegeneratingChip />
          <!-- Applied preset & size chips -->
          <div class="mb-2 text-xs opacity-80 flex gap-2 items-center" v-if="resolvedMode || (target.w && target.h)">
            <span class="px-2 py-0.5 rounded-full bg-white/5">Preset: {{ resolvedMode }}</span>
            <span class="px-2 py-0.5 rounded-full bg-white/5">{{ target.w }}×{{ target.h }} studs</span>
          </div>
          <div v-if="dropActive"
               class="absolute inset-0 rounded-2xl ring-2 ring-white/40 bg-white/5 pointer-events-none"></div>

        <!-- Always-present preview window -->
        <div class="min-h-[560px] rounded-xl bg-zinc-900/30 ring-1 ring-white/10 overflow-hidden grid place-items-center">
          <!-- Loading state -->
          <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">
            <div class="w-2/3 max-w-md text-center space-y-3">
              <div>Processing… <span v-if="progress">{{ Math.round(progress) }}%</span></div>
              <div class="h-2 w-full bg-white/10 rounded">
                <div class="h-2 bg-white/60 rounded" :style="{ width: Math.max(2, Math.round(progress)) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Preview content -->
          <div v-else-if="grid" class="w-full">
            <Transition mode="out-in"
                        enter-active-class="transition ease-out duration-300"
                        enter-from-class="opacity-0 translate-y-1"
                        enter-to-class="opacity-100 translate-y-0">
              <div :key="tab" class="animate-fade-in-up">
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
                    <div class="animate-fade-in-up">
                      <VoxelViewer :bricks="mosaic.tilingResult?.bricks || []" :visibleLayers="mosaic.visibleLayers" :studSize="1" :surface="(mosaic.settings.topSurface || 'plates') as any"/>
                    </div>
                  </ClientOnly>
                  <div class="mt-3">
                    <LayerSlider :maxLayers="mosaic.height || 1" :visibleLayers="mosaic.visibleLayers" @update:visibleLayers="mosaic.setVisibleLayers" :title="copy.builder3d.controls.layerSliderHelp"/>
                  </div>
                </template>
              </div>
            </Transition>

            <!-- Build card footer -->
            <footer class="mt-4 border-t border-white/10 relative">
              <!-- Actions row: centered, consistent height -->
              <div class="px-4 pt-4 pb-3 flex flex-wrap items-center justify-center gap-3">
                <button class="btn-mint inline-flex items-center gap-2 h-11 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="onDownloadPdf">
                  <!-- Download icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 19h16" stroke-linecap="round"/>
                  </svg>
                  <span>Download Build Guide (PDF)</span>
                </button>

                <button class="btn-soft inline-flex items-center gap-2 h-11 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="onDownloadPng">
                  <!-- Image icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="14" rx="2" ry="2"/>
                    <circle cx="8.5" cy="9.5" r="1.5"/>
                    <path d="M21 15l-6-6L5 19"/>
                  </svg>
                  <span>Export PNG</span>
                </button>

                <button class="btn-soft inline-flex items-center gap-2 h-11 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" :title="!mosaic.canExport ? 'Generate a mosaic to enable' : ''" @click="onDownloadCsv">
                  <!-- List icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
                  </svg>
                  <span>Download Parts List (CSV)</span>
                </button>

                <button class="btn-soft inline-flex items-center gap-2 h-11 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!mosaic.canExport" @click="openBLDialog" :title="'Downloads a BrickLink Wanted List you can upload at BrickLink → Wanted → Upload.'">
                  <!-- Package icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3Z" stroke-linejoin="round"/>
                    <path d="M12 12V21M3 7.5l9 4.5 9-4.5"/>
                  </svg>
                  <span>Export for BrickLink (.xml)</span>
                </button>
              </div>

              <!-- BrickLink export small dialog -->
              <div v-if="showBL" class="absolute right-4 z-20 mt-2 w-80 rounded-2xl border border-white/10 bg-black/70 p-4 shadow-soft-card">
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

              <!-- Metrics -->
              <div class="px-4 pb-2 flex items-center gap-4">
                <p v-if="mosaic.tilingResult" class="text-white/80 text-sm">
                  <span class="font-semibold">Bricks:</span> {{ mosaic.tilingResult.bricks.length }}
                  <span class="mx-3 opacity-30">•</span>
                  <span class="font-semibold">Est. cost:</span> ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}
                </p>
              </div>

              <!-- Disclaimer -->
              <p v-if="mosaic.tilingResult" class="px-4 text-xs text-white/50 pb-3">
                {{ PRICE_ESTIMATE_SHORT }}
              </p>

              <!-- Share row -->
              <div class="px-4 pb-4 flex items-center gap-3">
                <span class="text-xs text-white/60">Share:</span>
                <button
                  class="share-pill"
                  aria-label="Share on X"
                  @click="shareX"
                  title="Share on X"
                >
                  <!-- X icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 4l16 16M20 4L4 20" stroke-linecap="round"/>
                  </svg>
                </button>

                <button class="share-pill" aria-label="Share on Facebook" @click="shareFB" title="Share on Facebook">
                  <!-- Facebook icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v7h3v-7h2.2l.5-3H14V8Z"/>
                  </svg>
                </button>

                <button class="share-pill" aria-label="Share on Reddit" @click="shareReddit" title="Share on Reddit">
                  <!-- Reddit icon (simplified) -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none"/>
                    <path d="M9 14c1.5 1 4.5 1 6 0" stroke-linecap="round"/>
                  </svg>
                </button>

                <button class="share-pill" aria-label="Copy link" @click="copyLink" title="Copy link">
                  <!-- Link icon -->
                  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" stroke-linecap="round"/>
                    <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </footer>
          </div>

          <!-- Fallback 1: show uploaded image before mosaic is ready -->
          <img v-else-if="sourceImgUrl" :src="sourceImgUrl" alt="Uploaded" class="max-w-full max-h-full object-contain pointer-events-none select-none" />

          <!-- Fallback 2: empty state before any upload -->
          <EmptyMosaicPlaceholder v-else />
          </div>
        </div>
        </div>
        </ClientOnly>
      </section>
      </Transition>
    </div>
  </main>
</template>

