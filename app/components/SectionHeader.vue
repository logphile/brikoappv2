<template>
  <div class="mb-4 sm:mb-6">
    <h2 class="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-3">
      {{ title }}
      <span class="h-[3px] w-10 rounded-full bg-mint/80"></span>
    </h2>
    <p v-if="subtitle" class="mt-1 text-white/70">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
