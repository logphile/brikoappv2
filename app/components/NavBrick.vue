<template>
  <NuxtLink
    :to="to"
    :data-active="isActive ? 'true' : null"
    class="nav-brick group"
  >
    <span class="label">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{ to: string; label: string }>()
const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
</script>

<style scoped>
/* Base link */
.nav-brick {
  /* text + hit area */
  @apply relative inline-flex items-center px-3 py-1.5 text-xl leading-7 text-[#FF0062] ring-2 ring-brand-dark;
  /* keyboard accessibility */
  @apply outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062]/50 rounded-lg;
  /* smooth color transitions */
  @apply transition-colors;
}

/* “plate” behind text (appears on hover/active) */
.nav-brick::before {
  content: "";
  /* Hover/active fill becomes pink; base remains transparent */
  @apply absolute inset-0 rounded-lg bg-brand-pink opacity-0 transition-opacity;
}
.nav-brick:hover::before,
.nav-brick[data-active="true"]::before {
  @apply opacity-100;
}

/* right “notch” (little 1×2 plate) */
.nav-brick::after {
  content: "";
  @apply absolute top-1/2 -right-1.5 h-4 w-2 -translate-y-1/2 rounded bg-brand-dark transition;
}
.nav-brick:hover::after,
.nav-brick[data-active="true"]::after {
  @apply translate-x-1 bg-brand-dark;
}
/* optional glow on hover for a subtle LEGO vibe */
.nav-brick:hover::after { box-shadow: none; }

.label { @apply relative z-[1] text-[#FF0062]; }
/* Invert text color on hover/active to match pink background */
.nav-brick:hover .label,
.nav-brick[data-active="true"] .label { @apply text-brand-yellow; }
</style>
