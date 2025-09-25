<template>
  <header :class="['mx-auto', align === 'left' ? 'text-left' : 'text-center']">
    <h2 :class="[
      'font-extrabold tracking-tight leading-[1.1] text-[46px]',
      tone === 'sun' ? 'text-[#FFD808]' : tone === 'light' ? 'text-white' : 'text-[#343434]'
    ]">
      {{ title }}
    </h2>

    <p v-if="subtitle" :class="[
      'mt-2 leading-snug text-[1.125rem]',
      tone === 'sun' ? 'text-[#FFD808]' : tone === 'light' ? 'text-white/90' : 'text-ink/80'
    ]">
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
  tone?: 'dark' | 'light' | 'sun'
}>(), { align: 'center', tone: 'dark' })
</script>
