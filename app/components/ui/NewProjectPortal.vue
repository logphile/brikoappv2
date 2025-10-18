<template>
  <NewProjectModal v-model:open="ui.newProjectOpen" />
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import NewProjectModal from '@/components/ui/NewProjectModal.vue'
const ui = useUiStore()
</script>
