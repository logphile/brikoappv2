<script setup lang="ts">
import { ref } from 'vue'
import VoxelPreview from '@/components/VoxelPreview.client.vue'
import MosaicUploader from '@/components/MosaicUploader.client.vue'

const vox = ref<{ w:number; h:number; depth:number; colors: Uint8Array }|null>(null)
const loading = ref(false)
const size = ref(64) // 64³ target

async function onFile(file: File) {
  loading.value = true; vox.value = null
  const img = await createImageBitmap(file)
  const mod = await import('@/workers/voxel.worker?worker')
  const worker: Worker = new mod.default()
  const out: any = await new Promise(res=>{
    worker.onmessage = e => { res(e.data); worker.terminate() }
    worker.postMessage({ image: img, size: size.value }, [img])
  })
  vox.value = out; loading.value = false
}
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
      </section>
      <section class="lg:col-span-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-2">
        <div v-if="loading" class="h-[480px] grid place-items-center opacity-80">Processing…</div>
        <VoxelPreview v-else-if="vox" :vox="vox"/>
        <div v-else class="h-[480px] grid place-items-center opacity-60">Upload an image to begin</div>
      </section>
    </div>
  </main>
</template>
