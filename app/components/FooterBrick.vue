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
  @apply relative block text-sm text-[#FF0062] px-3 py-1.5 rounded-lg
         outline-none transition-colors hover:opacity-80
         focus-visible:ring-2 focus-visible:ring-[#FF0062]/50;
}

/* ink “plate” on hover */
.foot-brick::after{ content:""; }

/* notch (left side for footer stacks) */
.foot-brick::before{
  content:"";
  @apply absolute top-1/2 -left-1.5 h-4 w-2 -translate-y-1/2 rounded bg-[#FF0062]/20 transition;
}
.foot-brick:hover::before,
.foot-brick:focus-visible::before{
  @apply -translate-x-1 bg-[#FF0062];
  box-shadow: 0 0 0 2px rgba(255, 0, 98, .25);
}

.label { @apply relative z-[1] text-[#FF0062]; }
</style>
