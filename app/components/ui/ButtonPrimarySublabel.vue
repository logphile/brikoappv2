<template>
  <NuxtLink
    :to="to"
    v-bind="$attrs"
    class="nav-pill inline-flex flex-col items-start gap-0 rounded-2xl px-5 py-3 font-semibold"
  >
    <span class="text-base leading-tight">{{ label }}</span>
    <span class="text-[12px] leading-tight opacity-85">{{ sublabel }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; label: string; sublabel: string }>()
</script>
