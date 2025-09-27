<template>
  <div class="mb-4 sm:mb-6">
    <h2 class="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-3">
      {{ title }}
      <span class="h-[3px] w-10 rounded-full" :style="{ background: '#2F3061' }"></span>
    </h2>
  </div>
  
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
