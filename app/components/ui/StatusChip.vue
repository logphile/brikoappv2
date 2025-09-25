<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()
</script>

<template>
  <div
    role="note"
    class="inline-flex items-center gap-2 rounded-full px-4 py-2
           text-sm font-semibold text-ink bg-sun
           border border-black/5 shadow-[0_6px_20px_-6px_rgba(0,0,0,.25)]
           cursor-default select-none hover:-translate-y-[1px] transition"
  >
    <span class="material-symbols-rounded h-4 w-4 text-ink text-[18px]" aria-hidden="true">{{ icon }}</span>
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
/* Prevent accidental hover/tap effects from global styles */
div:hover,
div:focus,
div:active { box-shadow: none; }
:host { -webkit-tap-highlight-color: transparent; }
</style>
