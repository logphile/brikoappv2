<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  n: number
  size?: 'sm' | 'lg'
  active?: boolean
  asLink?: boolean
}>()

const sz = computed(() => props.size === 'lg'
  ? 'h-11 w-11 text-base'
  : 'h-7 w-7 text-xs')

const state = computed(() =>
  props.active
    ? 'bg-pink-500 text-white ring-2 ring-white/60 shadow-sm'
    : 'bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-white dark:ring-white/10'
)
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-full font-semibold select-none transition-colors"
    :class="[sz, state]"
    aria-hidden="true"
  >
    {{ n }}
  </span>
</template>
