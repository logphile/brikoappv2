<template>
  <NuxtLink
    :to="to"
    :class="['nav-pill', isActive && 'nav-active']"
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
/* No extra styles needed: uses global .nav-pill utility for lift/shadow */
</style>
