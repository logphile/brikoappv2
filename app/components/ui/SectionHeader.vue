<template>
  <header :class="['mx-auto', align === 'left' ? 'text-left' : 'text-center']">
    <h2 class="font-extrabold tracking-tight text-[#343434] leading-[1.1] text-[46px]">
      {{ title }}
    </h2>

    <p v-if="subtitle" class="mt-2 text-ink/80 leading-snug text-[1.125rem]">
      {{ subtitle }}
    </p>

    <!-- short pink underline: 64px wide, 3px thick, centered -->
    <span class="block mx-auto mt-3 h-[3px] w-16 rounded-full bg-pink"></span>
  </header>
  
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}>(), { align: 'center' })
</script>
