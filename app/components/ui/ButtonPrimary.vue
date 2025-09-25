<template>
  <component
    :is="as"
    :class="btnClass"
    v-bind="$attrs"
  >
    <slot />
  </component>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ as?: string; variant?: 'mint' | 'pink' }>(), { as: 'button', variant: 'mint' })

const btnClass = computed(() => {
  const base = `relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold
                transition-all duration-200 will-change-transform
                hover:translate-y-[-1px]
                active:translate-y-0
                focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none`
  if (props.variant === 'pink') {
    return [
      base,
      'text-brandYellow bg-pink',
      'shadow-[0_6px_20px_-6px_rgba(255,0,98,0.45)] hover:shadow-[0_10px_30px_-6px_rgba(255,0,98,0.55)]',
      'focus-visible:ring-2 focus-visible:ring-pink/60'
    ]
  }
  // default mint
  return [
    base,
    'text-ink bg-gradient-to-b from-mint to-mintLight',
    'shadow-[0_6px_20px_-6px_rgba(0,229,160,0.55)] hover:shadow-[0_10px_30px_-6px_rgba(0,229,160,0.65)]',
    'focus-visible:ring-2 focus-visible:ring-mint/70'
  ]
})
</script>
