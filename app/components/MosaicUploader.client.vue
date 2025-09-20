<script setup lang="ts">
import { ref } from 'vue'
import { useEmptyIcon } from '@/composables/useEmptyIcon'

const emit = defineEmits<{(e:'file', f:File):void}>()
const props = defineProps<{ embedded?: boolean }>()

const over = ref(false)
const emptySrc = useEmptyIcon()
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
        ? 'rounded-xl border border-white/10 bg-white/[.04] p-5 text-white/70 hover:border-mint/40 hover:bg-white/[.06] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mintRing/70'
        : 'p-4 rounded-2xl bg-white/5 ring-1 ring-white/10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-mintRing/70'
    ]"
  >
    <img :src="emptySrc" alt="" aria-hidden="true" class="mx-auto w-24 h-24 sm:w-32 sm:h-32 select-none" draggable="false" />
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
