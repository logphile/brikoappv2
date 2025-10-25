<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ values: number[], height?: number }>()
const h = computed(() => props.height ?? 28)
const w = 120
const max = computed(() => Math.max(1, ...props.values))
const pts = computed(() => props.values.map((v,i)=>{
  const x = (i/(Math.max(1, props.values.length-1))) * w
  const y = h.value - (v/max.value)*h.value
  return `${x},${y}` 
}).join(' '))
</script>

<template>
  <svg :width="w" :height="h" viewBox="0 0 120 28" class="opacity-70">
    <polyline :points="pts" fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
</template>
