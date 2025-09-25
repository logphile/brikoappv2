<template>
  <NuxtLink
    :to="to"
    class="foot-brick group"
  >
    <span class="label">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; label: string }>()
</script>

<style scoped>
/* Base link — smaller than header nav, same effects */
.foot-brick {
  @apply relative block text-sm px-3 py-1.5 rounded-lg outline-none transition-colors;
  color: #2F3061; /* navy base */
}

.foot-brick:hover, .foot-brick:focus-visible {
  color: #FF0062; /* pink on hover */
  text-decoration: underline;
  text-underline-offset: 3px;
}

.foot-brick:focus-visible {
  box-shadow: 0 0 0 2px rgba(255,0,98,0.35);
}

.label { @apply relative z-[1]; }
</style>
