<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  sub?: string
  tight?: boolean
  align?: 'center'|'left'
}>()
</script>

<template>
  <div :class="['section-head', tight && 'section-head--tight', align==='left' && 'text-left']">
    <p v-if="eyebrow" class="section-eyebrow">{{ eyebrow }}</p>
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="sub" class="section-sub">{{ sub }}</p>
    <div class="section-underline" />
  </div>
</template>
