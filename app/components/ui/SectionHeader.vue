<template>
  <header :class="['mx-auto', align === 'center' ? 'text-center' : 'text-left']">
    <h2 class="font-extrabold tracking-tight text-ink leading-[1.1] text-[46px]">
      {{ title }}
    </h2>

    <p class="mt-2 text-ink/80 leading-snug text-[1.125rem]">
      {{ subtitle }}
    </p>

    <!-- short pink underline: 64px wide, 3px thick -->
    <span class="block mt-3 h-[3px] w-16 rounded-full bg-pink"></span>
  </header>
  
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle: string
  align?: 'left' | 'center'
}>(), { align: 'center' })
</script>
