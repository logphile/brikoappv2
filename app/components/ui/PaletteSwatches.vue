<template>
  <div role="radiogroup" aria-label="Palette selector" class="chip-group">
    <label
      v-for="o in opts"
      :key="o.key"
      :title="o.tip"
      :class="['chip', modelValue === o.key && 'chip--active']"
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
      <span class="inline-flex items-center gap-1.5 mr-2" aria-hidden="true">
        <span v-for="(c, i) in o.colors" :key="i" class="h-3.5 w-3.5 rounded-sm ring-1 ring-black/10" :style="{ backgroundColor: c.hex }"></span>
      </span>
      <span class="text-sm">{{ o.label }}</span>
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
