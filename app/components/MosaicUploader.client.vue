<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{(e:'file', f:File):void}>()
const props = defineProps<{ embedded?: boolean }>()

const over = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

function onPick(e:Event){
  const f = (e.target as HTMLInputElement).files?.[0]; if(f) emit('file', f)
}
function onDrop(e:DragEvent){
  e.preventDefault(); over.value = false; const f = e.dataTransfer?.files?.[0]; if(f) emit('file', f)
}
function onOver(e: DragEvent){ e.preventDefault(); over.value = true }
function onLeave(e: DragEvent){ e.preventDefault(); over.value = false }
function onKey(e: KeyboardEvent){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); inputEl.value?.click() } }
</script>

<template>
  <div
    class="dropzone"
    @dragover="onOver" @dragenter="onOver" @dragleave="onLeave" @drop="onDrop"
    @keydown="onKey" role="button" tabindex="0" aria-label="Upload image"
    :data-dragover="over ? 'true' : null"
    :class="[
      props.embedded
        ? 'rounded-xl border border-[#343434]/20 bg-white/70 p-5 text-[#343434]/80 hover:bg-white/80 hover:border-[#FF0062]/40 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808]'
        : 'p-4 rounded-2xl bg-white/5 ring-1 ring-white/10 text-sm text-white/80 hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]'
    ]"
  >
    <span class="material-symbols-rounded block mx-auto text-[64px] text-[#FF0062]" aria-hidden="true">cloud_upload</span>
    <div class="mt-3 text-sm text-center">Drag & drop an image or</div>
    <label class="mt-2 inline-block cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">
      Browse… <input ref="inputEl" type="file" accept="image/*" class="hidden" @change="onPick">
    </label>
  </div>
</template>

<style scoped>
.dropzone img{ transition: transform .15s ease; }
.dropzone[data-dragover="true"] img{ transform: scale(1.05); }
</style>
