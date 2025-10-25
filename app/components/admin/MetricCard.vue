<script setup lang="ts">
import Sparkline from './Sparkline.vue'
const props = defineProps<{
  title: string
  value: number | string
  hint?: string
  series?: number[]
}>()
</script>

<template>
  <div class="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-4 flex items-center justify-between">
    <div>
      <p class="text-xs font-semibold tracking-wide text-black/60">{{ title }}</p>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-3xl font-black tracking-tight text-black" role="status">{{ value }}</span>
        <span v-if="hint" class="text-xs text-black/45">{{ hint }}</span>
      </div>
    </div>
    <div v-if="series?.length" class="text-purple-700">
      <Sparkline :values="series" />
    </div>
  </div>
</template>
