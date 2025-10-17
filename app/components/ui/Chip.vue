<script setup lang="ts">
defineProps<{
  on?: 'light' | 'ink'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1',
      on === 'ink'
        ? 'bg-white/10 text-white ring-white/20'
        : 'bg-black/5 text-gray-800 ring-black/10'
    ]"
  >
    <slot />
  </span>
</template>
