<template>
  <div class="space-y-2">
    <label class="block text-sm">Preset</label>
    <div class="chip-group">
      <button
        v-for="opt in opts"
        :key="opt.value"
        :class="['chip', preset === opt.value && 'chip--active']"
        @click.prevent="$emit('update:preset', opt.value)"
      >{{ opt.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ preset: 'auto'|'lineart'|'pop' }>()
const emit = defineEmits<{ (e:'update:preset', v:'auto'|'lineart'|'pop'): void }>()
const opts = [
  { value: 'auto', label: 'Auto' },
  { value: 'lineart', label: 'Line Art' },
  { value: 'pop', label: 'Photo Pop' }
] as const
</script>
