<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ accept?: string; maxSizeMb?: number; acceptLabel?: string }>()
const acceptText = computed(() => props.acceptLabel ?? 'PNG, JPG, or WebP')
const emit = defineEmits<{ (e:'files', files: FileList): void }>()

const inputRef = ref<HTMLInputElement | null>(null)
const onBrowse = () => inputRef.value?.click()
const onInput = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length) emit('files', files)
}
const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files && files.length) emit('files', files)
}
const onDragOver = (e: DragEvent) => e.preventDefault()
</script>

<template>
  <div class="rounded-xl border border-black/10 bg-white p-6" @drop="onDrop" @dragover="onDragOver">
    <div class="rounded-xl border border-black/10 p-8 text-center">
      <div class="mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#FF0062]/10">
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="#FF0062"><path d="M12 5l4 4h-3v6h-2V9H8l4-4z"/></svg>
      </div>
      <p class="text-[#343434]">Drag a photo here or</p>
      <button type="button" class="mt-2 inline-flex items-center rounded-lg border-2 border-[#FF0062] px-3 py-1 text-[#FF0062] font-medium hover:bg-[#FF0062]/5 transition" @click="onBrowse">Browse…</button>
      <p class="mt-2 text-sm text-black/60">
        {{ acceptText }} • up to {{ props.maxSizeMb ?? 25 }} MB
      </p>
      <input ref="inputRef" type="file" class="hidden" :accept="props.accept || 'image/png,image/jpeg,image/webp'" @change="onInput" />
    </div>
  </div>
</template>
