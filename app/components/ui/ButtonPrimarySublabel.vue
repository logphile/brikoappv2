<template>
  <NuxtLink
    :to="to"
    v-bind="$attrs"
    class="inline-flex flex-col justify-center rounded-2xl px-6 py-3
           bg-gradient-to-b from-mint to-mintLight text-ink font-semibold
           shadow-[0_10px_30px_-10px_rgba(0,229,160,.65)]
           transition hover:-translate-y-[1px] focus-visible:outline-none
           focus-visible:ring-2 focus-visible:ring-mint/70"
  >
    <span class="text-base leading-tight">{{ label }}</span>
    <span class="text-[12px] leading-tight opacity-85">{{ sublabel }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; label: string; sublabel: string }>()
</script>
