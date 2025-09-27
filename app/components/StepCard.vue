<template>
  <div class="rounded-2xl border border-[color:var(--ivory-border)] bg-white/70 p-4">
    <div class="flex items-start gap-3">
      <span class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-[var(--ivory)]"
            :style="{ background: '#2F3061' }">{{ num }}</span>
      <div>
        <h3 class="font-bold">{{ title }}</h3>
        <p class="mt-1 text-[color:var(--text-dim)]"><slot /></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ num: string | number; title: string }>()
</script>
