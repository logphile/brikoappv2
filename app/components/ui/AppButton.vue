<script setup lang="ts">
defineProps<{
  to?: string
  href?: string
  icon?: string
  label?: string
}>()
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : (href ? 'a' : 'button')"
    :to="to"
    :href="href"
    class="inline-flex items-center gap-2 rounded-2xl px-4 py-2
           bg-[#FF0062] text-white font-medium
           shadow-sm ring-1 ring-black/0
           transition-transform transition-shadow
           hover:-translate-y-0.5 hover:shadow-md
           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
           active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
  >
    <span v-if="icon" :class="icon" class="text-[18px]" />
    <span v-if="label">{{ label }}</span>
    <slot v-else />
  </component>
</template>
