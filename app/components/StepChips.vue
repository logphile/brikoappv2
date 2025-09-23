<template>
  <ul class="mt-3 flex flex-wrap gap-2">
    <li v-for="(s, i) in steps" :key="i"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[#343434]/80">
      <span class="grid h-5 w-5 place-items-center rounded-full bg-mint/20 text-[#343434] text-xs font-semibold">{{ i+1 }}</span>
      <span>{{ s }}</span>
    </li>
  </ul>
</template>
<script setup lang="ts">
// Simple reusable chips for step-by-step hints
defineProps<{ steps: readonly string[] }>()
</script>
