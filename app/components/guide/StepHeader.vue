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

const maxShown = computed(() => props.maxShown ?? 12) // default: 3 rows × 4 cols
const shown = computed(() => props.activeColors.slice(0, maxShown.value))
const extra = computed(() => Math.max(0, props.activeColors.length - shown.value.length))
</script>

<template>
  <header class="w-full grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-[#2F3061]/40 bg-[#2F3061]/15 px-4 py-3">
    <!-- LEFT: title + legend (wraps) -->
    <div class="min-w-0">
      <div class="flex items-baseline gap-2">
        <span class="text-sm uppercase tracking-wide text-[#343434]/80">Step</span>
        <span class="text-2xl font-semibold tabular-nums text-[#343434]">{{ step }}</span>
      </div>

      <!-- Legend -->
      <div class="mt-2">
        <p class="text-xs uppercase tracking-wide text-[#343434]/70 mb-1">Colors used in this step:</p>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-2 max-w-full">
          <li v-for="c in shown" :key="c.hex + c.name"
              class="min-w-[150px] pr-2 flex items-center justify-between gap-2 text-sm tabular-nums">
            <span class="flex items-center gap-2 min-w-0">
              <span class="h-3.5 w-3.5 rounded-sm border border-[#343434]/25" :style="{backgroundColor: c.hex}" />
              <span class="truncate text-[#343434]">{{ c.name || c.hex }}</span>
            </span>
            <span class="shrink-0 text-[#343434]/80">( {{ c.count }} )</span>
          </li>

          <!-- Overflow: +N more -->
          <li v-if="extra > 0" class="min-w-[150px] text-sm text-[#343434]/70">
            +{{ extra }} more
          </li>
        </ul>
      </div>
    </div>

    <!-- RIGHT: stats -->
    <div class="flex flex-col items-end justify-start gap-2 text-sm tabular-nums">
      <div class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-[#FF0062]" aria-hidden="true"></span>
        <span class="text-[#343434]/70">Place now</span>
        <strong class="text-[#343434]">{{ placedNow }}</strong>
      </div>
      <div class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-[#2F3061]" aria-hidden="true"></span>
        <span class="text-[#343434]/70">Total so far</span>
        <strong class="text-[#343434]">{{ totalPlaced }}</strong>
      </div>
    </div>
  </header>
</template>
