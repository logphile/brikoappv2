<template>
  <NuxtLink
    :to="to"
    v-bind="$attrs"
    :class="buttonClass"
  >
    <span :class="['text-base leading-tight', variant === 'pinkWhite' ? 'text-white' : '']">{{ label }}</span>
    <span :class="['text-[12px] leading-tight opacity-85', variant === 'pinkWhite' ? 'text-white/85' : '']">{{ sublabel }}</span>
  </NuxtLink>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ to: string; label: string; sublabel: string; variant?: 'nav' | 'pinkWhite' | 'pinkSun' }>(), { variant: 'nav' })

const buttonClass = computed(() => {
  if (props.variant === 'pinkWhite') {
    return `inline-flex flex-col items-start gap-0 rounded-2xl px-5 py-3 font-semibold
            bg-[#FF0062] text-white transition hover:bg-[#E00559] hover:translate-y-[1px]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD808]`
  }
  if (props.variant === 'pinkSun') {
    return `inline-flex flex-col items-start gap-0 rounded-2xl px-5 py-3 font-semibold
            bg-[#FF0062] text-[#FFD808] transition hover:bg-[#E00559] hover:translate-y-[1px]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0062] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3061]`
  }
  // default nav pill
  return `nav-pill inline-flex flex-col items-start gap-0 rounded-2xl px-5 py-3 font-semibold`
})
</script>
