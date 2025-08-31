<script setup lang="ts">
const emit = defineEmits<{(e:'file', f:File):void}>()
function onPick(e:Event){
  const f = (e.target as HTMLInputElement).files?.[0]; if(f) emit('file', f)
}
function onDrop(e:DragEvent){
  e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if(f) emit('file', f)
}
</script>

<template>
  <div @dragover.prevent class="p-4 rounded-2xl bg-white/5 ring-1 ring-white/10 text-sm"
       @drop="onDrop">
    <div>Drag & drop an image or</div>
    <label class="mt-2 inline-block cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">
      Browse… <input type="file" accept="image/*" class="hidden" @change="onPick">
    </label>
  </div>
</template>
