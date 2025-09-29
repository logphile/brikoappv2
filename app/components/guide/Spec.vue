<script setup lang="ts">
defineProps<{ label: string; value: string; unit?: string }>()
</script>

<template>
  <div class="print:break-inside-avoid">
    <div class="spec-label">{{ label }}</div>
    <div class="spec-value tabular-nums">
      {{ value }} <span v-if="unit" class="font-normal"> {{ unit }} </span>
    </div>
  </div>
</template>

<style scoped>
.spec-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#343434b3}
.spec-value{font-size:16px;line-height:1.25;font-weight:700;color:#343434}
</style>
