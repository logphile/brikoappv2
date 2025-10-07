<script setup lang="ts">
type Row = { hex: string; name?: string; count: number }
defineProps<{ rows: Row[] }>()
</script>

<template>
  <aside class="flex flex-col gap-2 p-3 rounded-2xl border border-[#2F3061]/30 bg-[#F5F4F1]">
    <h3 class="text-xs uppercase tracking-wide text-[#343434]/70">This step uses</h3>
    <ul class="flex flex-col gap-1">
      <li v-for="r in rows" :key="r.hex" class="flex items-center justify-between gap-3 text-sm tabular-nums">
        <span class="flex items-center gap-2">
          <span class="h-4 w-4 rounded-sm border border-[#343434]/20" :style="{ backgroundColor: r.hex }"></span>
          <span class="text-[#343434]">{{ r.name || r.hex }}</span>
        </span>
        <span class="text-[#343434]/80">× {{ r.count }}</span>
      </li>
    </ul>
  </aside>
</template>
