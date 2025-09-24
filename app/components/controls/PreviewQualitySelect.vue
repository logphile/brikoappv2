<template>
  <label class="text-sm block">
    <span class="block">Preview quality</span>
    <select class="mt-2 w-full rounded-xl border border-white/20 bg-white/70 text-gray-900 px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-pink-500"
            :value="quality" @change="$emit('update:quality', (($event.target as HTMLSelectElement).value as 'speed'|'balanced'|'detail'|'max'))">
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
