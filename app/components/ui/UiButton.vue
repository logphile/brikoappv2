<script setup lang="ts">
defineProps<{
  as?: string
  variant?: 'primary' | 'secondary' | 'pill'
  to?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>()
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : (as || 'button')"
    :to="to"
    :type="type || 'button'"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-2xl h-10 px-4 text-sm font-medium transition
           disabled:opacity-60 disabled:cursor-not-allowed"
    :class="{
      'bg-pink text-white hover:brightness-110 active:brightness-95': variant==='primary',
      'bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10': variant==='secondary',
      'h-8 px-3 rounded-xl ring-1 ring-black/10 bg-white/70 text-black hover:bg-white':
        variant==='pill'
    }"
  >
    <slot />
  </component>
</template>
