<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import MosaicUploader from '@/components/MosaicUploader.client.vue'
import MosaicCanvas from '@/components/MosaicCanvas.client.vue'
import StepCanvas from '@/components/StepCanvas.client.vue'
import VoxelViewer from '@/components/VoxelViewer.client.vue'
import LayerSlider from '@/components/LayerSlider.client.vue'
import { legoPalette } from '@/lib/palette/lego'
import { chunkSteps } from '@/lib/steps'
import type { WorkerOut } from '@/types/mosaic'
import { useMosaicStore } from '@/stores/mosaic'
import { exportBuildGuidePDF } from '@/lib/pdfExport'

const mosaic = useMosaicStore()

const target = ref<{w:number,h:number}>({ w: 128, h: 128 })
const grid = ref<WorkerOut|null>(null)
const loading = ref(false)
const showGrid = ref(true)
const useDither = ref(true)
const tab = ref<'2D'|'3D'>('2D')
// drag-n-drop on preview area + global guard
const dropActive = ref(false)

// Allowed parts multiselect
const ALL_PARTS = ['2x4','2x3','2x2','1x4','1x3','1x2','1x1'] as const
const selectedParts = ref<string[]>([...ALL_PARTS])
watch(selectedParts, (val)=>{ mosaic.setAllowedParts(val as any) }, { immediate: true })

async function onFile(file: File) {
  loading.value = true; grid.value = null
  const mod = await import('@/workers/mosaic.worker?worker')
  const worker: Worker = new (mod as any).default()
  const img = await createImageBitmap(file)

  const run = (w:number,h:number, dither:boolean) => new Promise<WorkerOut>((resolve)=>{
    worker.onmessage = (e)=> resolve(e.data as WorkerOut)
    worker.postMessage({ type:'process', image: img, width:w, height:h, palette: legoPalette, greedy: false, dither })
  })

  // Progressive: fast thumb (no tiling yet), then full-size indexes
  grid.value = await run(64, 64, useDither.value)
  const full = await run(target.value.w, target.value.w, useDither.value)
  grid.value = full
  worker.terminate()
  // Hook to store for tiling
  mosaic.setTargetSize(full.width, full.height)
  mosaic.setGrid(full.indexes as Uint16Array, full.width, full.height)
  loading.value = false
}

function onGenerate(){ mosaic.runGreedyTiling() }

async function saveNow(){ await mosaic.saveProject() }
async function uploadPrev(){ await mosaic.uploadPreview() }

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
onBeforeUnmount(()=>{ window.removeEventListener('dragover', preventWindowDrop); window.removeEventListener('drop', preventWindowDrop) })
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">Mosaic</h1>
    <p class="opacity-80">Upload an image → map to brick colors → preview & export.</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- left column -->
      <section class="lg:col-span-1 space-y-4">
        <MosaicUploader @file="onFile" />
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 space-y-3">
          <label class="block text-sm">Output size (studs)</label>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label>Width: {{ target.w }}<input type="range" min="8" max="256" v-model.number="target.w" @change="mosaic.setTargetSize(target.w, target.w)" class="w-full"></label>
            <label>Height: {{ target.w }}<input type="range" min="8" max="256" v-model.number="target.w" @change="mosaic.setTargetSize(target.w, target.w)" class="w-full"></label>
          </div>
          <label class="block text-sm mt-3">Allowed parts</label>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <label v-for="p in ALL_PARTS" :key="p" class="inline-flex items-center gap-2">
              <input type="checkbox" :value="p" v-model="selectedParts"> {{ p.replace('x','×') }}
            </label>
          </div>
          <label class="block text-sm mt-3">Orientation</label>
          <select v-model="mosaic.settings.snapOrientation" class="bg-black/40 rounded px-3 py-2">
            <option value="both">Both</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
          <label class="inline-flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" v-model="showGrid"> Show stud grid
          </label>
          <label class="inline-flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" v-model="useDither"> Dithering (Floyd–Steinberg)
          </label>
          <div class="flex gap-2 pt-2">
            <button class="px-4 py-2 rounded-xl bg-cta-grad disabled:opacity-40" :disabled="!grid || mosaic.status==='tiling'" @click="onGenerate">Generate mosaic</button>
            <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40" :disabled="!mosaic.tilingResult" @click="mosaic.exportPNG">Export PNG</button>
            <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40" :disabled="!mosaic.tilingResult" @click="mosaic.exportCSV">Export CSV</button>
            <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40" :disabled="!mosaic.currentProjectId" @click="saveNow">Save Project</button>
            <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40" :disabled="!mosaic.currentProjectId || !mosaic.tilingResult" @click="uploadPrev">Upload Preview</button>
          </div>
        </div>

        <div v-if="mosaic.tilingResult" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div class="font-semibold mb-2">BOM — Greedy tiling</div>
          <ul class="max-h-64 overflow-auto text-sm space-y-1">
            <li v-for="row in mosaic.tilingResult.bom" :key="row.part + '-' + row.colorId" class="flex justify-between">
              <span>{{ row.part.replace('x','×') }} · Color {{ row.colorId }}</span>
              <span>{{ row.qty }} pcs · ${{ row.estTotal.toFixed(2) }}</span>
            </li>
          </ul>
          <div class="mt-3 text-sm opacity-80">Est. cost: ${{ mosaic.tilingResult.estTotalCost.toFixed(2) }}</div>
        </div>
      </section>

      <!-- right preview with dropzone -->
      <section
        class="lg:col-span-2 relative rounded-2xl bg-white/5 ring-1 ring-white/10 p-4"
        @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop"
      >
        <div v-if="dropActive"
             class="absolute inset-0 rounded-2xl ring-2 ring-white/40 bg-white/5 pointer-events-none"></div>
        <div class="flex items-center gap-2 border-b border-white/10 pb-2 mb-3 text-sm">
          <button :class="['px-3 py-1 rounded', tab==='2D' ? 'bg-white/15' : 'hover:bg-white/10']" @click="tab='2D'">2D Mosaic</button>
          <button :class="['px-3 py-1 rounded', tab==='3D' ? 'bg-white/15' : 'hover:bg-white/10']" @click="tab='3D'">3D Preview</button>
          <div class="grow"></div>
          <button class="px-3 py-1 rounded bg-white/10 disabled:opacity-40" :disabled="!mosaic.tilingResult" @click="mosaic.tilingResult && exportBuildGuidePDF({ bricks: mosaic.tilingResult.bricks, width: mosaic.width, height: mosaic.height })">Export PDF</button>
        </div>

        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">Processing…</div>
        <div v-else-if="grid">
          <template v-if="tab==='2D'">
            <MosaicCanvas :data="grid" :showGrid="showGrid" :overlayBricks="mosaic.overlayBricks"/>
          </template>
          <template v-else>
            <VoxelViewer :bricks="mosaic.tilingResult?.bricks || []" :visibleLayers="mosaic.visibleLayers" :studSize="1"/>
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
        </div>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
      </section>
    </div>
  </main>
</template>

