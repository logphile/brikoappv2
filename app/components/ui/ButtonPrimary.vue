<template>
  <component
    :is="as"
    class="relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold
           text-ink shadow-[0_6px_20px_-6px_rgba(0,229,160,0.55)]
           bg-gradient-to-b from-mint to-mintLight
           transition-all duration-200 will-change-transform
           hover:translate-y-[-1px] hover:shadow-[0_10px_30px_-6px_rgba(0,229,160,0.65)]
           active:translate-y-0
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70
           disabled:opacity-50 disabled:pointer-events-none"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ as?: string }>(), { as: 'button' })
</script>
