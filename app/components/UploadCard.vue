<template>
  <div class="card-ivory p-4 rounded-2xl" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop" @paste="onPaste">
    <label class="block cursor-pointer">
      <div class="h-32 rounded-xl border border-[color:var(--ivory-border)] bg-[rgba(0,0,0,.04)] flex items-center justify-center">
        <p class="text-[color:var(--text-dim)]">Drag & drop an image or click to browse…</p>
      </div>
      <input
        ref="fileEl"
        type="file"
        class="sr-only"
        accept="image/png,image/jpeg,image/webp"
        :disabled="isProcessing"
        @change="onFileChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'loaded', p: { file: File; bitmap: ImageBitmap }): void
  (e: 'error', m: string): void
}>()

const fileEl = ref<HTMLInputElement | null>(null)
const isProcessing = ref(false)
const MAX = 25

function pick(f?: File | null): { file?: File; err?: string } {
  if (!f) return { err: 'No file' }
  if (!f.type?.startsWith('image/')) return { err: 'Choose an image file' }
  if (f.size > MAX * 1024 * 1024) return { err: `Max ${MAX} MB` }
  return { file: f }
}

async function handle(file: File) {
  try {
    isProcessing.value = true
    const bm = await createImageBitmap(file)
    emit('loaded', { file, bitmap: bm })
  } catch (e) {
    emit('error', 'Could not read that image.')
  } finally {
    isProcessing.value = false
    if (fileEl.value) fileEl.value.value = ''
  }
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  const { file, err } = pick(f || null)
  if (err) return emit('error', err)
  handle(file!)
}
function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files?.[0]
  const { file, err } = pick(f || null)
  if (err) return emit('error', err)
  handle(file!)
}
function onPaste(e: ClipboardEvent) {
  const f = Array.from(e.clipboardData?.files || [])[0]
  const { file, err } = pick(f || null)
  if (err) return emit('error', err)
  handle(file!)
}
</script>
