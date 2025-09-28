<template>
  <div class="mt-2 flex flex-wrap gap-2">
    <span v-for="(item, i) in items" :key="i"
          class="badge">
      <slot name="icon" v-if="false" />
      {{ item }}
    </span>
  </div>
</template>
<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>
