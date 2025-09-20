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
  @apply relative block text-sm text-white/80 px-3 py-1.5 rounded-lg
         outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mint/60;
}

/* ink “plate” on hover */
.foot-brick::after{
  content:"";
  @apply absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity;
}
.foot-brick:hover::after,
.foot-brick:focus-visible::after { @apply opacity-100; }

/* notch (left side for footer stacks) */
.foot-brick::before{
  content:"";
  @apply absolute top-1/2 -left-1.5 h-4 w-2 -translate-y-1/2 rounded bg-white/10 transition;
}
.foot-brick:hover::before,
.foot-brick:focus-visible::before{
  @apply -translate-x-1 bg-mint;
  box-shadow: 0 0 0 2px rgb(0 229 160 / .25);
}

.label { @apply relative z-[1] group-hover:text-white; }
</style>
