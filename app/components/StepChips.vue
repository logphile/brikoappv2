<template>
  <ul class="mt-3 flex flex-wrap gap-2">
    <li v-for="(s, i) in steps" :key="i"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[#343434]/80">
      <span class="h-7 w-7 grid place-items-center rounded-full bg-pink-500 text-white text-xs font-bold ring-2 ring-white/60">{{ i+1 }}</span>
      <span>{{ s }}</span>
    </li>
  </ul>
</template>
<script setup lang="ts">
// Simple reusable chips for step-by-step hints
defineProps<{ steps: readonly string[] }>()
</script>
