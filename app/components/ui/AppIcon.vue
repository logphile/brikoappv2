<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  name: string                   // e.g. "material-symbols:bolt-outline"
  size?: number | string         // px or tailwind classes can still be used
  class?: string
  title?: string                 // optional for a11y tooltips
}>()
</script>

<template>
  <Icon
    :icon="name"
    :width="size ?? 22"
    :height="size ?? 22"
    class="inline-block align-middle"
    :class="class"
    :title="title"
    aria-hidden="true"
  />
</template>
