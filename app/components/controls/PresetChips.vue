<template>
  <div class="space-y-2">
    <label class="block text-sm">Preset</label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in opts"
        :key="opt.value"
        class="btn-soft h-8 px-3 rounded-md"
        :class="preset === opt.value ? 'ring-1 ring-mint/60 bg-white/15' : ''"
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
