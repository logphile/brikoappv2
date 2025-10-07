<script setup lang="ts">
const model = defineModel<boolean>({ default: false }) // false = Private
</script>

<template>
  <div class="inline-flex rounded-full border text-xs font-medium overflow-hidden">
    <button
      class="px-3 py-1 transition"
      :class="!model ? 'bg-white/10 border-r border-white/10 text-white' : 'bg-transparent text-white/60 hover:text-white'"
      @click="model=false"
      type="button"
      aria-pressed="!model"
    >
      Private
    </button>
    <button
      class="px-3 py-1 transition"
      :class="model ? 'bg-green-500/20 text-green-200' : 'bg-transparent text-white/60 hover:text-white'"
      @click="model=true"
      type="button"
      aria-pressed="model"
    >
      Public
    </button>
  </div>
</template>
