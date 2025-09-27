<template>
  <div class="divide-y divide-[color:var(--ivory-border)]">
    <details v-for="(f,i) in items" :key="i" class="py-3 group">
      <summary class="cursor-pointer list-none flex items-center justify-between gap-4">
        <span class="font-semibold">{{ f.q }}</span>
        <span class="text-sm text-[color:var(--purple)] group-open:rotate-90 transition">›</span>
      </summary>
      <p class="mt-2 text-[color:var(--text-dim)]">{{ f.a }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { q: string; a: string }[] }>()
</script>
