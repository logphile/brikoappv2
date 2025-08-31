<script setup lang="ts">
import { ref, computed } from 'vue'
import MosaicUploader from '@/components/MosaicUploader.client.vue'
import MosaicCanvas from '@/components/MosaicCanvas.client.vue'
import { legoPalette } from '@/lib/palette/lego'
import { downloadCsv, downloadPng } from '@/lib/exporters'
import type { BomRow, WorkerOut } from '@/types/mosaic'

const target = ref<{w:number,h:number}>({ w: 128, h: 128 }) // 256 later
const grid = ref<WorkerOut|null>(null)
const loading = ref(false)
const showGrid = ref(true)

async function onFile(file: File) {
  loading.value = true
  grid.value = null
  const mod = await import('@/workers/mosaic.worker?worker')
  const worker: Worker = new mod.default()

  // ---- progressive: tiny preview then full ----
  const doPass = (w:number,h:number)=>
    new Promise<WorkerOut>(async (resolve)=>{
      worker.onmessage = (e)=>resolve(e.data as WorkerOut)
      const img = await createImageBitmap(file)
      worker.postMessage({ type:'process', image: img, width:w, height:h, palette: legoPalette }, [img])
    })
  const thumb = await doPass(64, 64)      // fast first look
  grid.value = thumb
  const full  = await doPass(target.value.w, target.value.h)
  grid.value = full
  loading.value = false
}
const bom = computed<BomRow[]>(() => grid.value?.bom ?? [])
const cost = computed<number>(() => bom.value.reduce((s: number, r: BomRow) => s + r.total_price, 0))
function onExportCsv(){ if(grid.value) downloadCsv(grid.value.bom) }
function onExportPng(){ if(grid.value) downloadPng('mosaic.png') }
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">Mosaic</h1>
    <p class="opacity-80">Upload an image → map to brick colors → preview & export.</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="lg:col-span-1 space-y-4">
        <MosaicUploader @file="onFile" />
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 space-y-3">
          <label class="block text-sm">Resolution</label>
          <select v-model.number="target.w" class="bg-black/40 rounded px-3 py-2">
            <option :value="64">64×64</option>
            <option :value="128">128×128</option>
            <option :value="256">256×256</option>
          </select>
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="showGrid"> Show stud grid
          </label>
          <div class="flex gap-2 pt-2">
            <button class="px-4 py-2 rounded-xl bg-cta-grad" :disabled="!grid" @click="onExportPng">Export PNG</button>
            <button class="px-4 py-2 rounded-xl bg-white/10" :disabled="!grid" @click="onExportCsv">Export CSV</button>
          </div>
        </div>

        <div v-if="bom.length" class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div class="font-semibold mb-2">BOM (1×1 studs)</div>
          <ul class="max-h-64 overflow-auto text-sm space-y-1">
            <li v-for="row in bom" :key="row.color_name" class="flex justify-between">
              <span class="flex items-center gap-2">
                <span class="inline-block h-3 w-3 rounded" :style="{background: row.hex}"></span>
                {{ row.color_name }}
              </span>
              <span>{{ row.qty }} pcs</span>
            </li>
          </ul>
          <div class="mt-3 text-sm opacity-80">Est. cost: ${{ cost.toFixed(2) }}</div>
        </div>
      </section>

      <section class="lg:col-span-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">Processing…</div>
        <MosaicCanvas v-else-if="grid" :data="grid" :showGrid="showGrid"/>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
      </section>
    </div>
  </main>
</template>
