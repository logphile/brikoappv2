<script setup lang="ts">
import { computed } from 'vue'
type ColorRow = { hex:string; name?:string; count:number }
const props = defineProps<{
  step: number
  placedNow: number
  totalPlaced: number
  activeColors: ColorRow[]
  maxShown?: number
}>()

const cap = computed(() => props.maxShown ?? 12)
const shown = computed(() => props.activeColors.slice(0, cap.value))
const extra = computed(() => Math.max(0, props.activeColors.length - shown.value.length))
</script>

<template>
  <header
    class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-[#2F3061]/40 bg-[#2F3061]/15 px-4 py-3">
    <!-- LEFT: title + legend -->
    <div class="min-w-0">
      <div class="flex items-baseline gap-2">
        <span class="text-sm uppercase tracking-wide text-[#343434]/80">Step</span>
        <span class="text-2xl font-semibold tabular-nums text-[#343434]">{{ step }}</span>
      </div>

      <p class="mt-2 text-xs uppercase tracking-wide text-[#343434]/70">Colors used in this step:</p>

      <!-- WRAPPING legend -->
      <ul class="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 max-w-full whitespace-normal overflow-hidden step-legend">
        <li v-for="c in shown" :key="c.hex + c.name"
            class="flex items-center gap-2 text-sm basis-[150px] grow min-w-[150px] tabular-nums">
          <span class="h-3.5 w-3.5 rounded-sm border border-[#343434]/25"
                :style="{ backgroundColor: c.hex }" aria-hidden="true" />
          <span class="truncate text-[#343434]">{{ c.name || c.hex }}</span>
          <span class="shrink-0 text-[#343434]/70">( {{ c.count }} )</span>
        </li>

        <!-- Overflow indicator -->
        <li v-if="extra > 0" class="text-sm text-[#343434]/70">+{{ extra }} more</li>
      </ul>
    </div>

    <!-- RIGHT: stats (don't wrap) -->
    <div class="flex flex-col items-end gap-1 text-sm tabular-nums whitespace-nowrap">
      <div><span class="text-[#343434]/70">Place now:</span> <strong class="text-[#343434]">{{ placedNow }}</strong></div>
      <div><span class="text-[#343434]/70">Total so far:</span> <strong class="text-[#343434]">{{ totalPlaced }}</strong></div>
    </div>
  </header>
</template>
