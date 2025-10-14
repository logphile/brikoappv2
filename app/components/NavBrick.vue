<template>
  <NuxtLink
    :to="to"
    class="nav-box nav-item transition"
    :class="[isActive ? 'text-white/95 after:w-full' : 'after:w-0']"
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
.nav-item { position: relative; }
.nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 2px;
  width: 0;
  background: currentColor;
  transition: width 200ms ease;
  border-radius: 999px;
}
</style>
