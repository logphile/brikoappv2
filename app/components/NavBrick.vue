<template>
  <NuxtLink
    :to="to"
    :class="['nav-link', isActive ? 'is-active' : '']"
  >
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{ to: string; label: string }>()
const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
</script>

<style scoped>
/* Visuals controlled by global .nav-link in app/assets/css/app.css */
</style>
