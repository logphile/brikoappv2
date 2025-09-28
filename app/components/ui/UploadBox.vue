<script setup lang="ts">
/**
 * Drop-in uploader that matches the 3D Builder style.
 * - Drag & drop or click "Browse…"
 * - Accepts images only (configurable)
 * - Optional paste-to-upload
 * - Emits `file` (File) or `error` (message)
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  paste?: boolean
  label?: string
  buttonText?: string
  variant?: 'panel' | 'glass'
}>(), {
  accept: 'image/*',
  maxSizeMB: 25,
  disabled: false,
  paste: true,
  label: 'Drag & drop an image or',
  buttonText: 'Browse…',
  variant: 'panel',
})

const emit = defineEmits<{
  (e: 'file', file: File): void
  (e: 'error', message: string): void
}>()

const over = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

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
  // Allow re-selecting the same file by clearing the input value
  if (inputEl.value) inputEl.value.value = ''
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
    class="uploadbox transition"
    :class="[
      props.variant === 'glass'
        ? 'rounded-xl border border-white/10 border-dashed bg-white/5 p-4 sm:p-5 text-white/90 focus-within:ring-2 focus-within:ring-mintRing/70'
        : 'rounded-md border border-[#343434]/20 bg-white p-4 sm:p-5 text-[#2F3061] focus-within:ring-2 focus-within:ring-[#FF0062] focus-within:ring-offset-2 focus-within:ring-offset-[#FFD808]',
      over ? (props.variant === 'glass' ? 'border-mint/60 bg-white/10' : 'border-[#FF0062]') : ''
    ]"
    :data-dragover="over ? 'true' : null"
    @dragover="onOver" @dragleave="onLeave" @drop="onDrop"
    role="button" tabindex="0" aria-label="Upload image"
  >
    <div class="flex items-center justify-center">
      <img src="/icons/icon-upload-circle-pink.svg" alt="" class="w-10 h-10 select-none pointer-events-none" aria-hidden="true" />
    </div>
    <p :class="props.variant==='glass' ? 'text-sm text-white/70' : 'text-sm text-[#2F3061]'">{{ label }}</p>
    <div class="mt-2">
      <button
        type="button"
        :class="[
          props.variant==='glass'
            ? 'btn-outline-mint'
            : 'px-3 py-2 rounded-md border border-[#FF0062] text-[#FF0062] bg-transparent text-sm font-medium hover:bg-[#343434] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808]'
        ]"
        class="transition disabled:opacity-50 disabled:pointer-events-none"
        :disabled="disabled"
        @click="onBrowse"
      >
        {{ buttonText }}
      </button>
      <span :class="props.variant==='glass' ? 'ml-3 text-xs text-white/60' : 'ml-3 text-xs text-[#2F3061]/70'">PNG, JPG, or WebP • up to {{ maxSizeMB }} MB</span>
    </div>

    <!-- Hidden input -->
    <input
      ref="inputEl"
      type="file"
      class="sr-only"
      :accept="accept"
      :disabled="disabled"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.uploadbox img{ transition: transform .15s ease; }
.uploadbox[data-dragover="true"] img{ transform: scale(1.05); }
</style>
