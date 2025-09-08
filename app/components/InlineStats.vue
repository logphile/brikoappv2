<template>
  <div class="mt-2 flex flex-wrap gap-2">
    <span v-for="(item, i) in items" :key="i"
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      <slot name="icon" v-if="false" />
      {{ item }}
    </span>
  </div>
</template>
<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>
