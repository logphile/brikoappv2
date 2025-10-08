// @ts-expect-error definePageMeta is a Nuxt macro available at runtime
definePageMeta({ ssr: false })
<template>
  <Transition appear enter-active-class="transition ease-out duration-600"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0">
  <main class="mx-auto max-w-7xl px-6 py-10 text-[#343434] mb-20">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-[#343434] text-4xl md:text-5xl font-bold">{{ copy.avatar.title }}</h1>
        <p class="text-[#2F3061] text-lg md:text-xl mb-8">{{ copy.avatar.subtitle }}</p>
        <nav aria-label="Quick guide" class="mt-8 flex flex-wrap gap-6 md:gap-8 items-center">
          <a v-for="(s, i) in stepsAvatar" :key="s.id" :href="'#' + s.id"
             :class="[
               'rounded-lg min-h-[40px] px-4 py-2 flex items-center gap-3 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
               (i <= activeStepIndex) ? 'bg-[#FF0062] text-[#FFD808] shadow-md' : 'bg-[#2F3061] text-white'
             ]">
            <UploadIcon v-if="s.id==='upload'" class="w-5 h-5" />
            <span v-else class="material-symbols-rounded text-[20px]" :class="(i <= activeStepIndex) ? 'text-[#FFD808]' : 'text-white'" aria-hidden="true">{{ s.icon }}</span>
            <span class="text-sm" :class="(i <= activeStepIndex) ? 'font-semibold' : ''">{{ s.title }}</span>
          </a>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                       :disabled="!outReady" @click="doExportPng">Export PNG</ButtonOutline>
        <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                       :disabled="saving || !canShare || !outReady" @click="saveAvatar">{{ saving ? 'Saving…' : 'Save' }}</ButtonOutline>
        <label class="rounded-lg px-4 py-2 border border-[#FF0062] text-[#FF0062] bg-transparent text-sm cursor-pointer select-none hover:bg-[#343434] hover:text-white transition"
               :class="(!projectId || !canShare) ? 'opacity-50 pointer-events-none' : ''">
          <input type="checkbox" class="sr-only" v-model="isPublic" :disabled="!projectId || !canShare" @change="onTogglePublic" />
          <span>{{ isPublic ? 'Public' : 'Make Public' }}</span>
        </label>
        <NuxtLink v-if="shareToken" :to="sharePath" class="text-sm underline">Share link</NuxtLink>
      </div>
    </div>

    <section class="mt-6">
      <div class="grid gap-6 lg:grid-cols-[460px,1fr] items-start">
        <!-- Controls column (yellow panel) -->
        <aside class="lg:col-span-1">
          <div class="rounded-2xl bg-[#FFD808] p-3 sm:p-4">
            <!-- Upload -->
            <section id="upload" class="scroll-mt-28 pt-2">
              <StepCard :step="1" title="Upload your photo">
                <template #actions>
                  <div class="hidden md:flex items-center gap-2">
                    <span class="text-xs text-[#2F3061]/80">Preset</span>
                    <PresetChips v-model:preset="preset" />
                  </div>
                </template>
                <div class="md:hidden mb-4">
                  <PresetChips v-model:preset="preset" />
                </div>
                <UploadCard accept="image/png,image/jpeg,image/webp" acceptLabel="PNG, JPG, or WebP" :maxSizeMb="25" @files="onAvatarFiles" />
              </StepCard>
            </section>

            <div class="divide-y divide-[#343434]/10">
              <!-- Style presets -->
              <section class="pt-4 pb-6">
                <h3 class="text-lg font-semibold text-[#343434] mb-1">Style presets</h3>
                <div class="mt-2">
                  <PresetChips v-model:preset="preset" />
                </div>
              </section>
              <!-- Output & Preview -->
              <section class="pt-4 pb-6">
                <h3 class="text-lg font-semibold text-[#343434] mb-1">Output & Preview</h3>
                <div class="space-y-4">
                  <OutputSizeControl v-model:width="widthStuds" v-model:height="heightStuds" />
                  <PreviewQualitySelect v-model:quality="quality" />
                </div>
              </section>

              <!-- Options -->
              <section class="pt-4 pb-6">
                <h3 class="text-lg font-semibold text-[#343434] mb-1">Options</h3>
                <div class="mt-2 flex flex-wrap gap-4 items-center text-[#2F3061]">
                  <label class="inline-flex items-center gap-2">
                    <input type="checkbox" class="h-4 w-4 accent-[#2F3061]" v-model="ditherFS" />
                    <span>Dither (FS)</span>
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input type="checkbox" class="h-4 w-4 accent-[#2F3061]" v-model="studStyle" />
                    <span>Stud style</span>
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input type="checkbox" class="h-4 w-4 accent-[#2F3061]" v-model="showPlateOutlines" />
                    <span>Show plate outlines</span>
                  </label>
                </div>
              </section>

              <!-- Palette -->
              <section class="pt-4 pb-6">
                <h3 class="text-lg font-semibold text-[#343434] mb-1">Palette</h3>
                <PaletteSwatches v-model="paletteName" />
              </section>

              <!-- Background -->
              <section class="pt-4 pb-6">
                <h3 class="text-lg font-semibold text-[#343434] mb-1">Background</h3>
                <div class="space-y-3">
                  <select v-model="bgMode" class="w-full rounded-xl border border-[#343434]/20 bg-white text-[#2F3061] focus:outline-none focus:ring-2 focus:ring-[#FF0062] px-3 py-2">
                    <option value="keep">Keep quantized image</option>
                    <option value="solid">Solid color</option>
                    <option value="transparent">Transparent</option>
                  </select>
                  <label v-if="bgMode==='solid'" class="block">
                    <span class="block text-[#2F3061]">Solid color</span>
                    <input type="color" v-model="bgSolid" class="mt-2 h-9 w-16 bg-white rounded border border-[#343434]/20" />
                  </label>
                </div>
              </section>

              <!-- Actions -->
              <section class="pt-4 pb-0">
                <h3 class="text-lg font-semibold text-[#343434] mb-3">Actions</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-4 sm:space-y-0">
                  <ButtonPrimary type="button" variant="pink" class="rounded-lg px-4 py-2 hover:bg-[#FF0062]/90 active:translate-y-[1px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading || !imgReady" @click="process">
                    <span v-if="!loading">Generate</span>
                    <span v-else>Processing…</span>
                  </ButtonPrimary>
                  <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!outReady || publishing" :aria-busy="publishing" @click="publishToGallery">Save to Gallery (private)</ButtonOutline>
                  <ButtonOutline type="button" variant="pink" class="rounded-lg px-4 py-2 border-[#FF0062] text-[#FF0062] bg-transparent hover:bg-[#343434] hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808] active:!translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!galleryProjectId" @click="makePublic">Make Public</ButtonOutline>
                </div>
                <div class="mt-3 inline-flex items-center gap-1 rounded-full border border-pink-500/80 bg-white/70 px-2 py-0.5 text-xs font-medium text-[#343434]">
                  <span class="material-symbols-rounded text-[16px] text-pink-500" aria-hidden="true">check_circle</span>
                  <span>OpenCV: {{ cvReady ? 'ready' : 'loading…' }}</span>
                </div>
              </section>
            </div>
          </div>
        </aside>

        <!-- Preview column (navy card) -->
        <section class="lg:col-span-1 rounded-xl shadow-lg ring-1 ring-[#343434]/20 bg-[#2F3061] p-6 relative">
          <div class="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
               @dragover.prevent
               @drop.prevent="onDropOverPreview"
               title="Drop an image to upload">
            <Transition name="fadein">
              <canvas v-show="outReady" ref="outCanvas" class="max-w-full"></canvas>
            </Transition>
            <!-- Grid overlay -->
            <div v-if="showPlateOutlines && lastTileSizePx" class="absolute inset-0 pointer-events-none" :style="gridOverlayStyle"></div>
            <div v-if="!outReady" class="absolute inset-0 grid place-items-center">
              <div class="text-center">
                <img :src="uploadIcon" alt="" aria-hidden="true" class="mx-auto mb-2 w-16 h-16 select-none" />
                <p class="text-sm text-[#FFD808]/80">Upload an image to begin.</p>
              </div>
            </div>
          </div>
        </section>
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
import { useSupabaseSafeClient } from '@/composables/useSupabaseSafeClient'
// Nuxt auto-imported composable (not used directly here)
declare const useSupabaseClient: <T = any>() => T
import { useRoute } from 'vue-router'
import ButtonPrimary from '@/components/ui/ButtonPrimary.vue'
import ButtonOutline from '@/components/ui/ButtonOutline.vue'
import UploadIcon from '@/components/ui/UploadIcon.vue'
import { useToasts } from '@/composables/useToasts'
import { lego16, lego32 } from '@/lib/palette/legoPresets'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { downloadPng } from '@/lib/exporters'
import { copy } from '@/lib/copy'
import PaletteSwatches from '@/components/ui/PaletteSwatches.vue'
import OutputSizeControl from '@/components/controls/OutputSizeControl.vue'
import PreviewQualitySelect from '@/components/controls/PreviewQualitySelect.vue'
import PresetChips from '@/components/controls/PresetChips.vue'
import { useRemixLoader } from '@/composables/useRemixLoader'
import { useProjects } from '@/composables/useProjects'
import StepCard from '@/components/ui/StepCard.vue'
import UploadCard from '@/components/ui/UploadCard.vue'

const { show } = useToasts()

// Stepper data and gating (align with 3D Builder style)
const stepsAvatar = [
  { id: 'upload', title: 'Upload', icon: 'cloud_upload' },
  { id: 'style', title: 'Pick style', icon: 'palette' },
  { id: 'download', title: 'Download poster', icon: 'download' },
]
const activeStepIndex = computed(() => {
  if (outReady.value) return 2
  if (imgReady.value) return 1
  return 0
})

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
    { name: 'twitter:image', content: 'https://briko.app/og-default.png' }],
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
// Preview overlay now uses inline pink upload icon to match 3D Builder
const uploadIcon = '/icons/icon-upload-circle-pink.svg'

// Supabase and persistence (SSR-safe)
const supabase = useSupabaseSafeClient<any>()
const saving = ref(false)
const projectId = ref<string>('')
const isPublic = ref(false)
const shareToken = ref('')
const canShare = computed(() => !!supabase)
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

// Helpers for preview sizing and immediate visual feedback
function fitContain(sw:number, sh:number, mw:number, mh:number){
  const sr = sw/sh, mr = mw/mh
  return mr > sr ? { width: Math.round(mh*sr), height: mh } : { width: mw, height: Math.round(mw/sr) }
}

function quickPreviewFromBitmap(bitmap: ImageBitmap){
  if (!outCanvas.value) return
  const { width, height } = fitContain(bitmap.width, bitmap.height, 768, 768)
  drawToCanvas(bitmap, outCanvas.value, width, height)
}

function onDropOverPreview(e: DragEvent){
  const f = e.dataTransfer?.files?.[0]
  if (!f) return
  if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) { try { show('Unsupported file. Use PNG, JPG, or WEBP.', 'error') } catch {}; return }
  if (f.size > 25 * 1024 * 1024) { try { show('Max 25 MB', 'error') } catch {}; return }
  ;(async()=>{
    try {
      try { show('Reading image…', 'info', 800) } catch {}
      const bm = await createImageBitmap(f)
      srcBitmap = bm
      srcFileRef.value = f
      imgReady.value = true
      quickPreviewFromBitmap(bm)
      outReady.value = true
      try { show('Image loaded', 'success', 1400) } catch {}
    } catch {
      try { show('Could not read image', 'error') } catch {}
    }
  })()
}

// UploadCard event bridge
function onUploadLoaded(p: { file: File; bitmap: ImageBitmap }) {
  try { show('Reading image…', 'info', 800) } catch {}
  // Prime state
  srcBitmap = p.bitmap
  srcFileRef.value = p.file
  imgReady.value = true
  // Immediate visual feedback
  quickPreviewFromBitmap(p.bitmap)
  outReady.value = true
  try { show('Image loaded', 'success', 1400) } catch {}
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
    if (!supabase) { try { show('Saving unavailable (Supabase disabled)', 'error') } catch {}; return }
    const u = await supabase.auth.getUser()
    const uid = u?.data?.user?.id
    if (!uid) { try { show('Please login to save', 'error') } catch {}; return }
    if (!outCanvas.value) { try { await process() } catch {} }
    if (!outCanvas.value) { try { show('Nothing to save yet', 'error') } catch {}; return }
    saving.value = true

    // Create project if needed
    if (!projectId.value) {
      const slug = `avatar-${rand(8)}`
      const insert = { user_id: uid, title: 'Avatar', slug, width: widthStuds.value, height: heightStuds.value }
      const { data, error } = await supabase.from('projects').insert(insert).select('*').single()
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
    const up = await supabase.storage.from('public').upload(path, blob, { upsert: true, contentType: 'image/png' })
    if (up.error) throw up.error

    // Record asset row
    const { error: aerr } = await supabase.from('assets').insert({ project_id: projectId.value, kind: 'avatar_png', storage_path: path })
    if (aerr) throw aerr

    try { show('Avatar saved', 'success') } catch {}
  } catch (e: any) {
    console.error(e)
    try { show(e?.message || 'Save failed', 'error') } catch {}
  } finally {
    saving.value = false
  }
}

// Bridge for StepCard + UploadCard
function onAvatarFiles(files: FileList){
  const f = files?.[0]
  if (f) handleSelfieFile(f)
}

async function onTogglePublic() {
  try {
    if (!supabase || !projectId.value) return
    const updates: any = { is_public: isPublic.value }
    if (isPublic.value && !shareToken.value) updates.share_token = rand(12)
    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId.value).select('*').single()
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
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  publishing.value = true
  try {
    const { canvasToWebpBlob } = useProjects()
    if (!outCanvas.value) throw new Error('No preview available to upload')
    const blob = await canvasToWebpBlob(outCanvas.value)

    // Upload preview to public storage
    const projectId = (globalThis.crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2)
    const fname = `avatar-preview-${widthStuds.value}x${heightStuds.value}-${preset.value}.webp`
    const storagePath = `projects/${user.id}/${projectId}/${fname}`
    {
      const { error: upErr } = await supabase.storage.from('projects').upload(storagePath, blob, { upsert: true, contentType: 'image/webp', cacheControl: 'public, max-age=86400' })
      if (upErr) throw upErr
    }

    // Insert private project row
    const payload: any = { id: projectId, user_id: user.id, title: 'Avatar', kind: 'avatar', status: 'private', preview_path: storagePath, tags: [] }
    const ins = await supabase.from('user_projects').insert(payload).select().single()
    if (ins.error) throw ins.error
    galleryProjectId.value = (ins.data as any)?.id || projectId
    try { show('Saved to your Gallery (private)', 'success') } catch {}
  } catch (e: any) {
    console.warn('[Avatar Publish] failed', e)
    try { show(`Save failed: ${e?.code ?? ''} ${e?.message ?? 'Error'}`.trim(), 'error') } catch {}
  } finally { publishing.value = false }
}

async function makePublic(){
  if (!galleryProjectId.value) return
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { location.href = '/login'; return }
  // Preconditions
  if (!widthStuds.value || !heightStuds.value) { try { show('Pick size first.', 'error') } catch {}; return }
  try {
    const { publishProject } = useProjects()
    const title = `Avatar ${widthStuds.value}×${heightStuds.value}`
    await publishProject(galleryProjectId.value, { title })
    try { show('Published!', 'success') } catch {}
  } catch (e: any) {
    console.error('[Avatar Make Public] error:', e)
    const msg = e?.message ? String(e.message) : String(e)
    try { show(`Publish failed: ${msg}`, 'error') } catch {}
  }
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

<style scoped>
.fadein-enter-active, .fadein-leave-active { transition: opacity .25s ease, transform .25s ease; }
.fadein-enter-from, .fadein-leave-to { opacity: 0; transform: translateY(6px); }
</style>


