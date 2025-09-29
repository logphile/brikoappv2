<script setup lang="ts">
defineProps<{ step: number; placedNow: number; totalPlaced: number }>()
</script>

<template>
  <header class="w-full grid grid-cols-2 items-center rounded-2xl border border-[#2F3061]/40 bg-[#2F3061]/15 px-4 py-3">
    <div class="flex items-baseline gap-3">
      <span class="text-sm uppercase tracking-wide text-[#343434]/80">Step</span>
      <span class="text-2xl font-semibold tabular-nums text-[#343434]"> {{ step }} </span>
    </div>
    <div class="flex justify-end gap-6 text-sm tabular-nums">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-[#FF0062]" aria-hidden="true"></span>
        <span class="text-[#343434]/70">Place now</span>
        <strong class="text-[#343434]">{{ placedNow }}</strong>
      </div>
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-[#2F3061]" aria-hidden="true"></span>
        <span class="text-[#343434]/70">Total so far</span>
        <strong class="text-[#343434]">{{ totalPlaced }}</strong>
      </div>
    </div>
  </header>
</template>
