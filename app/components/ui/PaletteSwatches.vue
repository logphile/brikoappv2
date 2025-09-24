<template>
  <div role="radiogroup" aria-label="Palette selector" class="flex flex-wrap gap-3">
    <label
      v-for="o in opts"
      :key="o.key"
      :title="o.tip"
      class="inline-flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer select-none transition
             border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-white/10"
      :class="modelValue === o.key ? 'border-pink-500 ring-2 ring-pink-500' : ''"
    >
      <input
        class="sr-only"
        type="radio"
        name="avatar-palette"
        :value="o.key"
        :checked="modelValue === o.key"
        @change="$emit('update:modelValue', o.key)"
      />
      <!-- Swatch row -->
      <span class="inline-flex items-center gap-1.5" aria-hidden="true">
        <span v-for="(c, i) in o.colors" :key="i" class="h-3.5 w-3.5 rounded-sm ring-1 ring-white/20" :style="{ backgroundColor: c.hex }"></span>
      </span>
      <span class="text-sm text-white/90">{{ o.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { lego16, lego32 } from '@/lib/palette/legoPresets'

const props = defineProps<{ modelValue: 'lego16' | 'lego32' }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: 'lego16' | 'lego32'): void }>()

const opts = computed(() => [
  { key: 'lego32', label: 'LEGO 32 (default)', tip: 'LEGO 32: the 32 canonical colors', colors: lego32.slice(0, 8) },
  { key: 'lego16', label: 'LEGO 16 (portrait)', tip: 'LEGO 16: portrait-focused subset', colors: lego16.slice(0, 8) }
] as const)
</script>
