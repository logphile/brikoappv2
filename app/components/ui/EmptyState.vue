<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ theme?: 'ink' | 'light'; title?: string }>()
const base = 'flex flex-col items-center justify-center rounded-2xl ring-1 ring-black/5 min-h-[320px] p-10 text-center'
const theme = computed(() =>
  props.theme === 'light'
    ? 'bg-[#1F2246]/90 text-white'
    : 'bg-white/40 text-[#111827]'
)
</script>

<template>
  <div :class="[base, theme]">
    <h3 class="text-lg font-semibold">{{ props.title || 'Nothing here yet' }}</h3>
    <p class="mt-2 text-sm opacity-80">
      <slot name="desc">Create something in Photo to Bricks or Briko Studio, then save it.</slot>
    </p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
