<template>
  <main class="mx-auto max-w-5xl px-6 py-10 text-white">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Avatar Builder</h1>
        <p class="opacity-80 text-sm">Upload a photo and map it to the LEGO palette. OpenCV.js loads on demand.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
                :disabled="!outReady"
                @click="doExportPng">Export PNG</button>
      </div>
    </div>

    <section class="mt-6 space-y-4">
      <div class="flex flex-wrap items-end gap-4 text-sm">
        <label class="block">
          <span class="block">Select image</span>
          <input ref="fileEl" type="file" accept="image/*" class="mt-1 block w-64 text-white" @change="onFileChange" />
        </label>

        <label class="block">
          <span class="block">Target size (studs)</span>
          <input type="range" min="32" max="256" step="16" v-model.number="size" class="mt-2 w-64"/>
          <div class="opacity-70 mt-1">{{ size }} × {{ size }}</div>
        </label>

        <label class="inline-flex items-center gap-2 mt-6">
          <input type="checkbox" v-model="dither" />
          <span>Dither (FS)</span>
        </label>

        <label class="inline-flex items-center gap-2 mt-6">
          <input type="checkbox" v-model="studStyle" />
          <span>Stud style</span>
        </label>

        <label class="block">
          <span class="block">Palette</span>
          <select v-model="paletteName" class="mt-2 bg-white/10 rounded-lg px-2 py-1.5">
            <option value="lego32">LEGO 32 (default)</option>
            <option value="lego16">LEGO 16 (portrait)</option>
          </select>
        </label>

        <label class="block">
          <span class="block">Background</span>
          <select v-model="bgMode" class="mt-2 bg-white/10 rounded-lg px-2 py-1.5">
            <option value="keep">Keep quantized image</option>
            <option value="solid">Solid color</option>
            <option value="transparent">Transparent</option>
          </select>
        </label>

        <label v-if="bgMode==='solid'" class="block">
          <span class="block">Solid color</span>
          <input type="color" v-model="bgSolid" class="mt-2 h-9 w-16 bg-white/10 rounded" />
        </label>

        <button class="px-4 py-2 rounded-xl bg-cta-grad disabled:opacity-50 mt-6"
                :disabled="loading || !imgReady"
                @click="process">{{ loading ? 'Processing…' : 'Generate' }}</button>

        <span class="ml-auto text-xs opacity-70 mt-6">OpenCV: <span :class="cvReady ? 'text-emerald-300' : 'text-yellow-300'">{{ cvReady ? 'ready' : 'loading…' }}</span></span>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mt-4">
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
          <div class="text-sm opacity-80 mb-2">Source (scaled)</div>
          <div class="aspect-square bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
            <canvas ref="srcCanvas" class="max-w-full"></canvas>
          </div>
        </div>
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
          <div class="text-sm opacity-80 mb-2">LEGO-mapped Output</div>
          <div class="aspect-square bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
            <canvas ref="outCanvas" class="max-w-full"></canvas>
          </div>
        </div>
      </div>
    </section>
  </main>
  
 </template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useToasts } from '@/composables/useToasts'
import { lego16, lego32 } from '@/lib/palette/legoPresets'
import { mapBitmapToPalette } from '@/lib/color-distance'
import { downloadPng } from '@/lib/exporters'

const { show } = useToasts()

// UI state
const size = ref(128)
const dither = ref(false)
const studStyle = ref(true)
const loading = ref(false)
const cvReady = ref(false)
const imgReady = ref(false)
const outReady = ref(false)

// Avatar options
type BgMode = 'transparent' | 'keep' | 'solid'
const paletteName = ref<'lego16' | 'lego32'>('lego32')
const activePalette = computed(() => (paletteName.value === 'lego16' ? lego16 : lego32))
const bgMode = ref<BgMode>('keep')
const bgSolid = ref('#0b0b0b')

// DOM refs
const fileEl = ref<HTMLInputElement | null>(null)
const srcCanvas = ref<HTMLCanvasElement | null>(null)
const outCanvas = ref<HTMLCanvasElement | null>(null)

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

function drawToCanvas(bitmap: ImageBitmap, cvs: HTMLCanvasElement, target: number) {
  const ctx = cvs.getContext('2d', { willReadFrequently: true })!
  const w = target, h = target
  cvs.width = w; cvs.height = h
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0,0,w,h)
  ctx.drawImage(bitmap, 0, 0, w, h)
}

function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  createImageBitmap(file).then((bmp) => {
    srcBitmap = bmp
    imgReady.value = true
    if (srcCanvas.value) drawToCanvas(bmp, srcCanvas.value, size.value)
    outReady.value = false
  }).catch((e) => { console.error(e); try { show('Failed to read image', 'error') } catch {} })
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

async function process() {
  if (!srcBitmap || !srcCanvas.value || !outCanvas.value) return
  loading.value = true
  try {
    // Draw source to target size
    drawToCanvas(srcBitmap, srcCanvas.value, size.value)

    // Optional OpenCV preprocessing (grayscale + slight blur for noise)
    if (cvReady.value) {
      try {
        const src = cv.imread(srcCanvas.value)
        const dst = new cv.Mat()
        cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB, 0)
        // Gentle bilateral filter to keep edges while smoothing colors
        cv.bilateralFilter(dst, dst, 5, 50, 50)
        cv.imshow(srcCanvas.value, dst)
        src.delete(); dst.delete()
      } catch (e) {
        console.warn('OpenCV preprocessing skipped', e)
      }
    }

    // Read pixels and map to selected LEGO palette (supports optional FS dithering)
    const ctx = srcCanvas.value.getContext('2d', { willReadFrequently: true })!
    const img = ctx.getImageData(0, 0, srcCanvas.value.width, srcCanvas.value.height)
    const indices = mapBitmapToPalette(img, activePalette.value, { dither: dither.value ? 'floyd-steinberg' : 'none' })
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
  downloadPng('briko-avatar.png')
}

onMounted(async () => {
  try { await loadOpenCV() } catch (e) { console.warn(e); try { show('OpenCV failed to load — continuing without it', 'error') } catch {} }
})

// Instant preview updates on control changes
watch([size, dither, studStyle, paletteName, bgMode, bgSolid], () => {
  if (imgReady.value && !loading.value) {
    // Debounce via microtask to batch rapid changes
    Promise.resolve().then(() => process())
  }
})

</script>
