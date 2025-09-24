<template>
  <div class="space-y-2">
    <label class="block text-sm">Preset</label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in opts"
        :key="opt.value"
        class="h-8 px-3 rounded-full border text-xs font-medium transition
               border-white/15 bg-white/10 text-white/90 hover:bg-white/15
               focus:outline-none focus:ring-2 focus:ring-pink-500/60"
        :class="preset === opt.value ? 'border-pink-500 text-gray-900 bg-white/80' : ''"
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
