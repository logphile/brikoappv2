<template>
  <span class="relative inline-flex">
    <button
      type="button"
      class="h-5 w-5 grid place-items-center rounded-full border border-white/15 text-white/70 hover:text-white"
      @mouseenter="open = true" @mouseleave="open = false" @focus="open = true" @blur="open = false"
      :aria-label="label"
    >i</button>

    <div v-if="open"
         class="absolute z-20 mt-2 w-64 rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-white/80 shadow-soft-card"
         role="tooltip">
      <slot />
    </div>
  </span>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)
defineProps<{ label?: string }>()
</script>
