<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()
</script>

<template>
  <div
    role="note"
    class="inline-flex items-center gap-2 rounded-full border border-pink-500/90
           bg-white/70 backdrop-blur-sm px-3 py-1 text-sm font-medium text-gray-900
           shadow-[0_1px_0_rgba(0,0,0,0.05)] cursor-default select-none"
  >
    <span class="material-symbols-rounded h-4 w-4 text-pink-500 text-[18px]" aria-hidden="true">{{ icon }}</span>
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
