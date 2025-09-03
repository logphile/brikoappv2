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
import { ref, onMounted } from 'vue'
import { useToasts } from '@/composables/useToasts'
import { legoPalette } from '@/lib/palette/lego'
import { rgbToLab, deltaE } from '@/utils/color'
import { exportPng } from '@/utils/exportPng'

const { show } = useToasts()

// UI state
const size = ref(128)
const dither = ref(false)
const loading = ref(false)
const cvReady = ref(false)
const imgReady = ref(false)
const outReady = ref(false)

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

// Precompute palette in Lab for nearest-color mapping
const paletteLab = legoPalette.map(c => rgbToLab(c.rgb))
function nearestColorIndex(rgb: [number, number, number]) {
  const lab = rgbToLab(rgb)
  let best = 0, bestD = Number.POSITIVE_INFINITY
  for (let i = 0; i < paletteLab.length; i++) {
    const d = deltaE(lab as any, paletteLab[i] as any)
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

function quantizeToLego(image: ImageData, useDither = false) {
  const { data, width, height } = image
  // Basic per-pixel quantization (dithering stub optional)
  // If dithering enabled, you could wire through a FS pass here.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i], g = data[i+1], b = data[i+2]
      const idx = nearestColorIndex([r, g, b])
      const rgb = legoPalette[idx].rgb
      data[i] = rgb[0]; data[i+1] = rgb[1]; data[i+2] = rgb[2]
      data[i+3] = 255
    }
  }
  return image
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

    // Read pixels and quantize to LEGO palette
    const ctx = srcCanvas.value.getContext('2d', { willReadFrequently: true })!
    const img = ctx.getImageData(0, 0, srcCanvas.value.width, srcCanvas.value.height)
    const q = quantizeToLego(img, dither.value)

    // Paint output
    const octx = outCanvas.value.getContext('2d')!
    outCanvas.value.width = q.width; outCanvas.value.height = q.height
    octx.putImageData(q, 0, 0)

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
  if (!outCanvas.value) return
  exportPng(outCanvas.value, 'briko-avatar.png')
}

onMounted(async () => {
  try { await loadOpenCV() } catch (e) { console.warn(e); try { show('OpenCV failed to load — continuing without it', 'error') } catch {} }
})
</script>
