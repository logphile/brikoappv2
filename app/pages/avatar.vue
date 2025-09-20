<template>
  <Transition appear enter-active-class="transition ease-out duration-600"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0">
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ copy.avatar.title }}</h1>
        <p class="opacity-80 text-sm">{{ copy.avatar.subtitle }}</p>
        <StepChips :steps="copy.avatar.steps" />
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-primary h-10"
                :disabled="!outReady"
                @click="doExportPng">Export PNG</button>
        <button class="btn-outline-mint h-10"
                :disabled="saving || !$supabase || !outReady"
                @click="saveAvatar">{{ saving ? 'Saving…' : 'Save' }}</button>
        <label class="btn-outline-mint h-10 inline-flex items-center gap-2 text-sm px-3 rounded-2xl cursor-pointer select-none"
               :class="(!projectId || !canShare) ? 'opacity-50 pointer-events-none' : ''">
          <input type="checkbox" class="sr-only" v-model="isPublic" :disabled="!projectId || !canShare" @change="onTogglePublic" />
          <span>{{ isPublic ? 'Public' : 'Make Public' }}</span>
        </label>
        <NuxtLink v-if="shareToken" :to="sharePath" class="text-sm underline">Share link</NuxtLink>
      </div>
    </div>

    <section class="mt-6">
      <div class="grid gap-6 lg:grid-cols-[460px,1fr]">
        <!-- Controls column -->
        <aside class="card-glass p-4 space-y-4">
          <PresetChips v-model:preset="preset" />

          <UploadBox
            :maxSizeMB="25"
            accept="image/*"
            @file="handleSelfieFile"
            @error="(msg) => { try { show(msg, 'error') } catch { console.warn(msg) } }"
          />

          <OutputSizeControl v-model:width="widthStuds" v-model:height="heightStuds" />
          <PreviewQualitySelect v-model:quality="quality" />

          <div class="flex flex-wrap gap-4 items-center">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="ditherFS" />
              <span>Dither (FS)</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="studStyle" />
              <span>Stud style</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="showPlateOutlines" />
              <span>Show plate outlines</span>
            </label>
          </div>

          <div class="block">
            <span class="block">Palette</span>
            <PaletteSwatches v-model="paletteName" class="mt-2" />
          </div>

          <div class="block">
            <span class="block">Background</span>
            <select v-model="bgMode" class="select-mint mt-2">
              <option value="keep">Keep quantized image</option>
              <option value="solid">Solid color</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
          <label v-if="bgMode==='solid'" class="block">
            <span class="block">Solid color</span>
            <input type="color" v-model="bgSolid" class="mt-2 h-9 w-16 bg-white/10 rounded" />
          </label>

          <div class="flex items-center gap-3 pt-2">
            <button class="btn-mint" :disabled="loading || !imgReady" @click="process">{{ loading ? 'Processing…' : 'Generate' }}</button>
            <span class="ml-auto text-xs opacity-70">OpenCV: <span :class="cvReady ? 'text-emerald-300' : 'text-yellow-300'">{{ cvReady ? 'ready' : 'loading…' }}</span></span>
          </div>

          <div class="flex gap-2 pt-1">
            <button class="btn-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!outReady || publishing" :aria-busy="publishing" @click="publishToGallery">Save to Gallery (private)</button>
            <button class="btn-outline-mint px-4 rounded-xl disabled:opacity-40 disabled:pointer-events-none" :disabled="!galleryProjectId" @click="makePublic">Make Public</button>
          </div>
        </aside>

        <!-- Preview column -->
        <main class="card-glass p-3">
          <div class="text-sm opacity-80 mb-2">LEGO-mapped Output</div>
          <div class="relative aspect-square bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
            <canvas ref="outCanvas" class="max-w-full"></canvas>
            <!-- Grid overlay -->
            <div v-if="showPlateOutlines && lastTileSizePx" class="absolute inset-0 pointer-events-none"
                 :style="gridOverlayStyle"></div>
            <div v-if="!outReady" class="absolute inset-0 grid place-items-center text-white/70">
              <div class="text-center">
                <img :src="emptySrc" alt="" aria-hidden="true" class="mx-auto mb-2 w-24 h-24 sm:w-32 sm:h-32 select-none" draggable="false" />
                <div class="text-sm">Upload an image to begin.</div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <!-- Hidden source canvas for processing -->
      <canvas ref="srcCanvas" class="hidden"></canvas>
    </section>
  </main>
  </Transition>
  
 </template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useNuxtApp, useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useEmptyIcon } from '@/composables/useEmptyIcon'
import { useToasts } from '@/composables/useToasts'
import { lego16, lego32 } from '@/lib/palette/legoPresets'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { downloadPng } from '@/lib/exporters'
import { copy } from '@/lib/copy'
import StepChips from '@/components/StepChips.vue'
import UploadBox from '@/components/ui/UploadBox.vue'
import PaletteSwatches from '@/components/ui/PaletteSwatches.vue'
import OutputSizeControl from '@/components/controls/OutputSizeControl.vue'
import PreviewQualitySelect from '@/components/controls/PreviewQualitySelect.vue'
import PresetChips from '@/components/controls/PresetChips.vue'
import { useRemixLoader } from '@/composables/useRemixLoader'
import { useProjects } from '@/composables/useProjects'

const { show } = useToasts()

// SEO
useHead({
  title: 'Avatar Builder',
  meta: [
    { name: 'description', content: 'Upload a photo, map it to the LEGO palette, and export a stud-style avatar.' },
    { property: 'og:title', content: 'Avatar Builder | Briko' },
    { property: 'og:description', content: 'Upload a photo, map it to the LEGO palette, and export a stud-style avatar.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://briko.app/avatar' },
    { property: 'og:image', content: 'https://briko.app/og-default.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Avatar Builder | Briko' },
    { name: 'twitter:description', content: 'Upload a photo, map it to the LEGO palette, and export a stud-style avatar.' },
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://briko.app/avatar' }
  ]
})

// UI state
const preset = ref<'auto'|'lineart'|'pop'>('auto')
const widthStuds = ref(48)
const heightStuds = ref(64)
const quality = ref<'speed'|'balanced'|'detail'|'max'>('balanced')
const ditherFS = ref(false)
const studStyle = ref(true)
const showPlateOutlines = ref(false)
const loading = ref(false)
const cvReady = ref(false)
const imgReady = ref(false)
const outReady = ref(false)

// Avatar options
type BgMode = 'transparent' | 'keep' | 'solid'
const paletteName = ref<'lego16' | 'lego32'>('lego32')
const activePalette = computed(() => (paletteName.value === 'lego16' ? lego16 : lego32))
const bgMode = ref<BgMode>('keep')
const route = useRoute()
const bgSolid = ref('#111827')
// Branded empty/upload icon for preview overlay
const emptySrc = useEmptyIcon()

// Supabase and persistence
const { $supabase } = useNuxtApp() as any
const saving = ref(false)
const projectId = ref<string>('')
const isPublic = ref(false)
const shareToken = ref('')
const canShare = computed(() => !!$supabase)
const sharePath = computed(() => shareToken.value ? `/s/${shareToken.value}` : '')
const { loadingFromSrc, loadInto } = useRemixLoader()
const { createProject, makePublic: makePublicProject } = useProjects()

// DOM refs
const srcCanvas = ref<HTMLCanvasElement | null>(null)
const outCanvas = ref<HTMLCanvasElement | null>(null)
const lastTileSizePx = ref(8)
const srcFileRef = ref<File | null>(null)

let srcBitmap: ImageBitmap | null = null
let cv: any = null

function loadOpenCV() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    // already loaded
    if ((window as any).cv && (window as any).cv['Mat']) {
      cv = (window as any).cv
      cvReady.value = true
      return resolve()
    }
    const s = document.createElement('script')
    s.src = 'https://docs.opencv.org/4.x/opencv.js'
    s.async = true
    s.onload = () => {
      const wcv = (window as any).cv
      if (!wcv) { resolve(); return }
      wcv['onRuntimeInitialized'] = () => {
        cv = wcv
        cvReady.value = true
        resolve()
      }
    }
    s.onerror = (e) => { console.error(e); reject(new Error('Failed to load OpenCV.js')) }
    document.head.appendChild(s)
  })
}

function drawToCanvas(bitmap: ImageBitmap, cvs: HTMLCanvasElement, wTarget: number, hTarget: number) {
  const ctx = cvs.getContext('2d', { willReadFrequently: true })!
  const w = Math.max(1, Math.floor(wTarget))
  const h = Math.max(1, Math.floor(hTarget))
  cvs.width = w; cvs.height = h
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0,0,w,h)
  ctx.drawImage(bitmap, 0, 0, w, h)
}

async function handleSelfieFile(file: File) {
  try {
    const bmp = await createImageBitmap(file)
    srcBitmap = bmp
    srcFileRef.value = file
    imgReady.value = true
    if (srcCanvas.value) {
      const { pw, ph } = qualityToPreviewSize(quality.value, widthStuds.value, heightStuds.value)
      drawToCanvas(bmp, srcCanvas.value, pw, ph)
    }
    outReady.value = false
  } catch (e) {
    console.error(e)
    try { show('Failed to read image', 'error') } catch {}
  }
}

// Render helpers
function imageDataFromIndices(indices: Uint16Array, w: number, h: number, palette = activePalette.value): ImageData {
  const img = new ImageData(w, h)
  const data = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = indices[y * w + x]
      const [r, g, b] = palette[idx]?.rgb || [204, 204, 204]
      const o = (y * w + x) * 4
      data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255
    }
  }
  return img
}

function buildStudTile(hex: string, s: number): HTMLCanvasElement {
  const cvs = document.createElement('canvas')
  cvs.width = s; cvs.height = s
  const ctx = cvs.getContext('2d')!
  ctx.clearRect(0, 0, s, s)

  // Base disc
  const cx = s * 0.5, cy = s * 0.5, r = Math.floor(s * 0.42)
  ctx.fillStyle = hex
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Shadow (multiply) from bottom-right
  const shadow = ctx.createRadialGradient(s * 0.75, s * 0.75, r * 0.1, s * 0.8, s * 0.8, r)
  shadow.addColorStop(0, 'rgba(0,0,0,0.0)')
  shadow.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = shadow
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  // Highlight (screen) near top-left
  const hl = ctx.createRadialGradient(s * 0.28, s * 0.28, 0, s * 0.28, s * 0.28, r * 0.9)
  hl.addColorStop(0, 'rgba(255,255,255,0.6)')
  hl.addColorStop(1, 'rgba(255,255,255,0.0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = hl
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  // Rim
  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = Math.max(1, Math.floor(s * 0.06))
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()

  return cvs
}

function renderStuds(
  indices: Uint16Array,
  w: number,
  h: number,
  out: HTMLCanvasElement,
  opts: { bgMode: BgMode; bgColor: string; quantized?: ImageData },
  palette = activePalette.value
) {
  // Aim for ~512px output width
  const px = Math.max(6, Math.floor(512 / w))
  lastTileSizePx.value = px
  out.width = w * px
  out.height = h * px
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, out.width, out.height)

  // Background
  if (opts.bgMode === 'solid') {
    ctx.fillStyle = opts.bgColor || '#0b0b0b'
    ctx.fillRect(0, 0, out.width, out.height)
  } else if (opts.bgMode === 'keep' && opts.quantized) {
    const bgCvs = document.createElement('canvas')
    bgCvs.width = w; bgCvs.height = h
    const bctx = bgCvs.getContext('2d')!
    bctx.putImageData(opts.quantized, 0, 0)
    ctx.drawImage(bgCvs, 0, 0, out.width, out.height)
  } // transparent => leave clear

  // Cache tiles by palette index
  const cache = new Map<number, HTMLCanvasElement>()
  for (let i = 0; i < palette.length; i++) {
    cache.set(i, buildStudTile(palette[i].hex, px))
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = indices[y * w + x]
      const tile = cache.get(idx)
      if (tile) ctx.drawImage(tile, x * px, y * px)
    }
  }
}

function qualityToPreviewSize(q: 'speed'|'balanced'|'detail'|'max', w: number, h: number) {
  const base = { speed: 32, balanced: 64, detail: 96, max: 128 }[q] ?? 64
  const scale = Math.max(w, h)
  const factor = base / Math.max(32, Math.min(128, scale))
  return { pw: Math.max(16, Math.round(w * factor)), ph: Math.max(16, Math.round(h * factor)) }
}

async function process() {
  if (!srcBitmap || !srcCanvas.value || !outCanvas.value) return
  loading.value = true
  try {
    // Draw source to preview size derived from quality + target studs
    const { pw, ph } = qualityToPreviewSize(quality.value, widthStuds.value, heightStuds.value)
    drawToCanvas(srcBitmap, srcCanvas.value, pw, ph)

    // Optional OpenCV preprocessing (grayscale + slight blur for noise)
    if (cvReady.value) {
      try {
        const src = cv.imread(srcCanvas.value)
        const dst = new cv.Mat()
        cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB, 0)
        // Tweaks by preset
        if (preset.value === 'lineart') {
          // Stronger smoothing, edge-friendly
          cv.bilateralFilter(dst, dst, 7, 65, 65)
        } else if (preset.value === 'pop') {
          // Slight contrast/brightness lift
          cv.convertScaleAbs(dst, dst, 1.12, 8)
        } else {
          cv.bilateralFilter(dst, dst, 5, 50, 50)
        }
        cv.imshow(srcCanvas.value, dst)
        src.delete(); dst.delete()
      } catch (e) {
        console.warn('OpenCV preprocessing skipped', e)
      }
    }

    // Read pixels and map to selected LEGO palette (supports optional FS dithering)
    const ctx = srcCanvas.value.getContext('2d', { willReadFrequently: true })!
    const img = ctx.getImageData(0, 0, srcCanvas.value.width, srcCanvas.value.height)
    const indices = mapBitmapToPalette(img, activePalette.value, { dither: ditherFS.value ? 'floyd-steinberg' : 'none' })
    const q = imageDataFromIndices(indices, img.width, img.height, activePalette.value)

    // Paint output: pixels or stud-style
    if (!studStyle.value) {
      const octx = outCanvas.value.getContext('2d')!
      outCanvas.value.width = q.width; outCanvas.value.height = q.height
      octx.putImageData(q, 0, 0)
    } else {
      renderStuds(
        indices,
        img.width,
        img.height,
        outCanvas.value,
        { bgMode: bgMode.value, bgColor: bgSolid.value, quantized: bgMode.value === 'keep' ? q : undefined },
        activePalette.value
      )
    }

    // Expose canvas for unified export/upload hooks
    ;(window as any).__brikoCanvas = outCanvas.value
    outReady.value = true
    try { show('Generated avatar preview', 'success') } catch {}
  } catch (e) {
    console.error(e)
    try { show('Failed to generate avatar', 'error') } catch {}
  } finally {
    loading.value = false
  }
}

function doExportPng() {
  try {
    // Re-render at full output resolution for export
    if (!srcBitmap || !outCanvas.value) return downloadPng('briko-avatar.png')
    const tmp = document.createElement('canvas')
    const { pw, ph } = { pw: widthStuds.value, ph: heightStuds.value }
    drawToCanvas(srcBitmap, tmp, pw, ph)
    const ctx = tmp.getContext('2d')!
    const img = ctx.getImageData(0, 0, tmp.width, tmp.height)
    const indices = mapBitmapToPalette(img, activePalette.value, { dither: ditherFS.value ? 'floyd-steinberg' : 'none' })
    // Paint to export canvas
    const exp = document.createElement('canvas')
    renderStuds(indices, tmp.width, tmp.height, exp, { bgMode: bgMode.value, bgColor: bgSolid.value }, activePalette.value)
    // Swap into preview and global handle, then download
    const octx = outCanvas.value.getContext('2d')!
    outCanvas.value.width = exp.width; outCanvas.value.height = exp.height
    octx.drawImage(exp, 0, 0)
    ;(window as any).__brikoCanvas = outCanvas.value
    downloadPng('briko-avatar.png')
  } catch {
    downloadPng('briko-avatar.png')
  }
}

// Utilities
function rand(n = 12) { return Math.random().toString(36).slice(2, 2 + n) }

async function canvasToBlob(cvs: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    cvs.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), type, quality)
  })
}

async function saveAvatar() {
  try {
    if (!$supabase) { try { show('Saving unavailable (Supabase disabled)', 'error') } catch {}; return }
    const u = await $supabase.auth.getUser()
    const uid = u?.data?.user?.id
    if (!uid) { try { show('Please login to save', 'error') } catch {}; return }
    if (!outCanvas.value) { try { await process() } catch {} }
    if (!outCanvas.value) { try { show('Nothing to save yet', 'error') } catch {}; return }
    saving.value = true

    // Create project if needed
    if (!projectId.value) {
      const slug = `avatar-${rand(8)}`
      const insert = { owner: uid, title: 'Avatar', slug, width: widthStuds.value, height: heightStuds.value }
      const { data, error } = await $supabase.from('projects').insert(insert).select('*').single()
      if (error) throw error
      projectId.value = data.id
      isPublic.value = !!data.is_public
      shareToken.value = data.share_token || ''
    }

    // Create 256px thumb and upload
    const thumb = document.createElement('canvas')
    thumb.width = 256; thumb.height = 256
    const tctx = thumb.getContext('2d')!
    tctx.clearRect(0, 0, 256, 256)
    // For transparent bg preserve alpha; for others draw as-is
    tctx.drawImage(outCanvas.value, 0, 0, 256, 256)
    const blob = await canvasToBlob(thumb, 'image/png')
    const path = `projects/${projectId.value}/avatar_${Date.now()}.png`
    const up = await $supabase.storage.from('public').upload(path, blob, { upsert: true, contentType: 'image/png' })
    if (up.error) throw up.error

    // Record asset row
    const { error: aerr } = await $supabase.from('assets').insert({ project_id: projectId.value, kind: 'avatar_png', storage_path: path })
    if (aerr) throw aerr

    try { show('Avatar saved', 'success') } catch {}
  } catch (e: any) {
    console.error(e)
    try { show(e?.message || 'Save failed', 'error') } catch {}
  } finally {
    saving.value = false
  }
}

async function onTogglePublic() {
  try {
    if (!$supabase || !projectId.value) return
    const updates: any = { is_public: isPublic.value }
    if (isPublic.value && !shareToken.value) updates.share_token = rand(12)
    const { data, error } = await $supabase.from('projects').update(updates).eq('id', projectId.value).select('*').single()
    if (error) throw error
    shareToken.value = data.share_token || ''
    try { show(isPublic.value ? 'Project is public' : 'Project is private', 'success') } catch {}
  } catch (e: any) {
    try { show(e?.message || 'Failed to update sharing', 'error') } catch {}
  }
}

onMounted(async () => {
  try { await loadOpenCV() } catch (e) { console.warn(e); try { show('OpenCV failed to load — continuing without it', 'error') } catch {} }
})

// Instant preview updates on control changes
watch([widthStuds, heightStuds, quality, preset, ditherFS, studStyle, paletteName, bgMode, bgSolid], () => {
  if (imgReady.value && !loading.value) {
    // Debounce via microtask to batch rapid changes
    Promise.resolve().then(() => process())
  }
})

// Remix preload via shared loader
onMounted(() => {
  const src = route.query.src as string | undefined
  if (src) loadInto(handleSelfieFile, decodeURIComponent(src))
})
watch(() => route.query.src, (src) => {
  if (typeof src === 'string' && src) loadInto(handleSelfieFile, decodeURIComponent(src))
})

// Gallery publishing (avatar)
const galleryProjectId = ref<string | null>(null)
const publishing = ref(false)
async function publishToGallery(){
  if (!outReady.value) return
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  publishing.value = true
  try {
    const rec = await createProject({
      title: 'Avatar',
      kind: 'avatar',
      width: widthStuds.value,
      height: heightStuds.value,
      palette_id: paletteName.value,
      sourceFile: srcFileRef.value || undefined,
      mode: preset.value === 'lineart' ? 'line-art' : (preset.value === 'pop' ? 'photo' : 'auto'),
      makePublic: false,
    })
    galleryProjectId.value = rec.id
    try { show('Saved to your Gallery (private)', 'success') } catch {}
  } catch (e) {
    console.warn(e); try { show('Save failed', 'error') } catch {}
  } finally { publishing.value = false }
}

async function makePublic(){
  if (!galleryProjectId.value) return
  if (!$supabase) return
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  try { await makePublicProject(galleryProjectId.value, user.id); try { show('Your avatar is public!', 'success') } catch {} }
  catch(e){ console.warn(e); try { show('Failed to publish', 'error') } catch {} }
}

const gridOverlayStyle = computed(() => {
  const s = Math.max(4, lastTileSizePx.value)
  const color = 'rgba(255,255,255,0.08)'
  return {
    backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    backgroundSize: `${s}px ${s}px`,
  } as any
})
</script>
