<template>
  <AppCard>
    <h2 class="mb-3 text-lg font-semibold">Controls</h2>
    <AppTabs v-model="mode" :tabs="['mosaic','voxel']">
      <template #default="slot">
        <div v-if="slot?.active === 'mosaic'" class="space-y-3">
          <AppInput v-model="size">
            <template #label>Size (px)</template>
          </AppInput>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="dithering" /> Dithering
          </label>
        </div>
        <div v-else class="space-y-3">
          <AppInput v-model="voxDepth">
            <template #label>Depth (layers)</template>
          </AppInput>
        </div>
      </template>
    </AppTabs>
    <div class="mt-4 flex gap-2">
      <AppButton @click="$emit('run')">Run</AppButton>
      <AppButton class="bg-brand-a2 text-black" @click="$emit('export')">Export</AppButton>
    </div>
  </AppCard>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
const store = useProjectStore()
const mode = computed({
  get: () => store.mode,
  set: (v: 'mosaic' | 'voxel') => (store.mode = v)
})
const size = ref(256)
const dithering = ref(true)
const voxDepth = ref(16)
</script>
