<template>
  <label class="text-sm block">
    <span class="block">Preview quality</span>
    <select class="select-mint mt-2" :value="quality" @change="$emit('update:quality', ($event.target as HTMLSelectElement).value)">
      <option value="speed">Speed (32×32)</option>
      <option value="balanced">Balanced (64×64)</option>
      <option value="detail">Detail (96×96)</option>
      <option value="max">Max (128×128)</option>
    </select>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ quality: 'speed'|'balanced'|'detail'|'max' }>()
const emit = defineEmits<{ (e:'update:quality', v:'speed'|'balanced'|'detail'|'max'): void }>()
</script>
