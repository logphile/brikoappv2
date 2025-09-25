<template>
  <header class="text-center max-w-3xl mx-auto mb-8 md:mb-10">
    <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-2 text-base text-ink/80">
      {{ subtitle }}
    </p>
    <span class="block mx-auto mt-3 h-1.5 w-16 rounded-full bg-pink"></span>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
