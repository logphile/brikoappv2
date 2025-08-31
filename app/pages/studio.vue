<template>
  <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-4">
    <div class="md:col-span-1"><StudioControls @run="onRun" @export="onExport" /></div>
    <div class="md:col-span-2"><StudioCanvas /></div>
    <div class="md:col-span-1"><StudioStats /></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { usePalette } from '@/composables/usePalette'
const store = useProjectStore()
const { load } = usePalette()

onMounted(() => load())

function onRun() { store.setBOM([], 0) }
function onExport() { /* TODO: export */ }
</script>
