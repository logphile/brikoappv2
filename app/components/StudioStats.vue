<template>
  <AppCard>
    <h2 class="mb-3 text-lg font-semibold">Stats</h2>
    <div class="text-sm text-white/80">
      <div class="flex justify-between"><span>Parts:</span> <span>{{ store.bom.length }}</span></div>
      <div class="flex justify-between"><span>Est. Price:</span> <span>${{ store.estPrice.toFixed(2) }}</span></div>
    </div>
    <div class="mt-3 text-xs text-white/50">BOM and price will appear after processing.</div>
  </AppCard>
</template>
<script setup lang="ts">
const store = useProjectStore()
</script>
