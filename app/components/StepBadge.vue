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
    ? 'bg-[#FFD808] text-[#343434] border border-[#343434]/20 shadow-sm'
    : 'bg-white text-[#343434] border border-[#343434]/10 shadow-sm'
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
