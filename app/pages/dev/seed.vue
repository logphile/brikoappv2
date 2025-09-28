<script setup lang="ts">
import { ref } from 'vue'
import { useMosaicify } from '@/composables/useMosaicify'
import { useProjects } from '@/composables/useProjects'
import { useToasts } from '@/composables/useToasts'

// Basic guard: require dev build or ?dev=1
const isAllowed = import.meta.dev || (typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('dev') === '1')

const files = ref<File[]>([])
const running = ref(false)
const pct = ref(0)
const { mosaicifyFromFile } = useMosaicify()
const { createProject } = useProjects()
const { show: toast } = useToasts()

async function run(){
  if (!isAllowed) { alert('Dev-only page. Append ?dev=1 in dev environment.'); return }
  if (!files.value.length) return
  running.value = true
  pct.value = 0
  try {
    for (let i = 0; i < files.value.length; i++) {
      const f = files.value[i]
      const { blob } = await mosaicifyFromFile(f, { w: 48, h: 48, paletteId: 'briko-v1', mode: 'auto' })
      await createProject({
        title: f.name.replace(/\.[^.]+$/, ''),
        kind: 'mosaic',
        width: 48,
        height: 48,
        palette_id: 'briko-v1',
        previewBlob: blob,
        sourceFile: f,
        makePublic: true,
      })
      pct.value = Math.round(((i + 1) / files.value.length) * 100)
    }
    toast('Seeding complete')
  } catch (e) {
    console.error(e)
    toast('Seed failed: ' + String((e as any)?.message || e))
  } finally {
    running.value = false
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto p-6 text-white">
    <h1 class="text-xl font-semibold">Dev: Seed Gallery</h1>
    <p class="text-sm text-white/80">Batch-create mosaic previews and publish them to the Community Gallery. Dev-only.</p>

    <div v-if="!isAllowed" class="mt-4 text-yellow-300/90 text-sm">
      This page is restricted. Run in dev or append <code>?dev=1</code>.
    </div>

    <div class="mt-4 space-y-3">
      <input type="file" accept="image/*" multiple @change="(e:any)=> files = Array.from(e.target.files || [])" />
      <button class="btn-pink focus-cyber" :disabled="running || !files.length || !isAllowed" @click="run">Seed {{ files.length }} images</button>
      <div v-if="running" class="text-sm">Seeding… {{ pct }}%</div>
      <p class="text-xs opacity-80">Uses your account. Please only upload content you own or CC0/Public Domain for the public gallery.</p>
    </div>
  </main>
</template>
