<template>
  <component
    :is="as"
    class="relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold
           text-mint border border-mint/60 bg-transparent
           transition-all duration-200 will-change-transform
           hover:bg-mint/10 hover:translate-y-[-1px]
           hover:shadow-[0_10px_30px_-6px_rgba(0,229,160,0.45)]
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
