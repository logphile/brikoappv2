<template>
  <div class="flex items-center gap-3">
    <label class="text-sm opacity-80">Layers</label>
    <input type="range" :min="1" :max="maxLayers" :value="visibleLayers" @input="onInput" class="w-full" />
    <div class="text-sm opacity-80 w-20 text-right">{{ visibleLayers }} / {{ maxLayers }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ maxLayers: number; visibleLayers: number }>()
const emit = defineEmits<{ (e: 'update:visibleLayers', v: number): void }>()
function onInput(e: Event){
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:visibleLayers', v)
}
</script>
