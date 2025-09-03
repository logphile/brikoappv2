<script setup lang="ts">
import { ref } from 'vue'
import VoxelPreview from '@/components/VoxelPreview.client.vue'
import MosaicUploader from '@/components/MosaicUploader.client.vue'
import { useMosaicStore } from '@/stores/mosaic'
import { downloadPng } from '@/lib/exporters'
import type { VoxelGrid, VoxelWorkerOut } from '@/types/voxel'
import { PRICE_ESTIMATE_SHORT } from '@/lib/disclaimer'

const vox = ref<VoxelGrid | null>(null)
const loading = ref(false)
const progress = ref(0)
const size = ref(64) // 64³ target
const mosaic = useMosaicStore()

async function onFile(file: File) {
  loading.value = true; vox.value = null; progress.value = 0
  const img = await createImageBitmap(file)
  const mod = await import('@/workers/voxel.worker?worker')
  const worker: Worker = new mod.default()
  worker.onmessage = (e: MessageEvent<VoxelWorkerOut>) => {
    const msg = e.data
    if (msg.type === 'progress') {
      progress.value = msg.pct
    } else if (msg.type === 'done') {
      vox.value = msg.grid
      progress.value = 100
      loading.value = false
      worker.terminate()
    }
  }
  worker.postMessage({ image: img, size: size.value }, [img])
}

function exportPng(){ downloadPng('briko-voxel.png') }
async function uploadPreview(){ await mosaic.uploadPreview() }
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10 text-white">
    <h1 class="text-3xl font-bold">Voxel (preview)</h1>
    <p class="opacity-80">Extruded heightmap from an image → InstancedMesh studs.</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="space-y-4">
        <MosaicUploader @file="onFile" />
        <div class="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <label class="block text-sm">Resolution</label>
          <select v-model.number="size" class="bg-black/40 rounded px-3 py-2">
            <option :value="32">32³</option>
            <option :value="64">64³</option>
          </select>
        </div>
        <p v-if="vox" class="mt-2 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
      <section class="lg:col-span-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-2">
        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">
          <div class="w-2/3 max-w-md text-center space-y-3">
            <div>Processing… <span v-if="progress">{{ progress }}%</span></div>
            <div class="h-2 w-full bg-white/10 rounded">
              <div class="h-2 bg-white/60 rounded" :style="{ width: Math.max(2, progress) + '%' }"></div>
            </div>
          </div>
        </div>
        <VoxelPreview v-else-if="vox" :vox="vox"/>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
        <div v-if="vox" class="px-2 pb-2 flex gap-2">
          <button class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20" @click="exportPng">Export PNG</button>
          <button class="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-40 hover:bg-white/20 disabled:hover:bg-white/10" :disabled="!mosaic.currentProjectId" @click="uploadPreview">Upload Preview</button>
        </div>
        <p v-if="vox" class="px-2 pb-3 text-xs opacity-60">{{ PRICE_ESTIMATE_SHORT }}</p>
      </section>
    </div>
  </main>
</template>
