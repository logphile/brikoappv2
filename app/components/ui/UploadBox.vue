<script setup lang="ts">
/**
 * Drop-in uploader that matches the 3D Builder style.
 * - Drag & drop or click "Browse…"
 * - Accepts images only (configurable)
 * - Optional paste-to-upload
 * - Emits `file` (File) or `error` (message)
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useEmptyIcon } from '@/composables/useEmptyIcon'

const props = withDefaults(defineProps<{
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  paste?: boolean
  label?: string
  buttonText?: string
}>(), {
  accept: 'image/*',
  maxSizeMB: 25,
  disabled: false,
  paste: true,
  label: 'Drag & drop an image or',
  buttonText: 'Browse…',
})

const emit = defineEmits<{
  (e: 'file', file: File): void
  (e: 'error', message: string): void
}>()

const over = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const emptySrc = useEmptyIcon()

function isOk(file: File) {
  if (!file) return 'No file selected'
  if (props.accept && !file.type.startsWith('image/')) return 'Please upload an image'
  if (file.size > props.maxSizeMB * 1024 * 1024) return `Max ${props.maxSizeMB} MB`
  return ''
}

function handleFiles(list: FileList | null) {
  const file = list?.[0]
  const msg = file ? isOk(file) : 'No file selected'
  if (msg) { emit('error', msg); return }
  emit('file', file!)
}

function onDrop(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault(); e.stopPropagation()
  over.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}
function onOver(e: DragEvent) { if (!props.disabled){ e.preventDefault(); over.value = true } }
function onLeave(e: DragEvent) { if (!props.disabled){ e.preventDefault(); over.value = false } }

function onBrowse() { if (!props.disabled) inputEl.value?.click() }
function onChange(e: Event) { handleFiles((e.target as HTMLInputElement).files) }

function onPaste(e: ClipboardEvent) {
  if (!props.paste || props.disabled) return
  const file = [...(e.clipboardData?.files ?? [])][0]
  if (file) handleFiles({ 0:file, length:1, item:() => file } as unknown as FileList)
}

onMounted(() => props.paste && window.addEventListener('paste', onPaste))
onBeforeUnmount(() => props.paste && window.removeEventListener('paste', onPaste))
</script>

<template>
  <div
    class="uploadbox rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5
           transition ring-0 focus-within:ring-2 ring-emerald-400/60"
    :class="over ? 'border-emerald-400/60 bg-emerald-400/5' : ''"
    :data-dragover="over ? 'true' : null"
    @dragover="onOver" @dragleave="onLeave" @drop="onDrop"
    role="button" tabindex="0" aria-label="Upload image"
  >
    <img :src="emptySrc" alt="" aria-hidden="true" class="mx-auto w-24 h-24 sm:w-32 sm:h-32 select-none" draggable="false" />
    <p class="text-sm text-white/80">{{ label }}</p>
    <div class="mt-2">
      <button
        type="button"
        class="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium
               transition disabled:opacity-50 disabled:pointer-events-none"
        :disabled="disabled"
        @click="onBrowse"
      >
        {{ buttonText }}
      </button>
      <span class="ml-3 text-xs text-white/50">PNG, JPG, or WebP • up to {{ maxSizeMB }} MB</span>
    </div>

    <!-- Hidden input -->
    <input
      ref="inputEl"
      type="file"
      class="sr-only"
      :accept="accept"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.uploadbox img{ transition: transform .15s ease; }
.uploadbox[data-dragover="true"] img{ transform: scale(1.05); }
</style>
