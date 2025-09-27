<template>
  <div>
    <div class="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <ProjectCard v-for="p in items" :key="p.id" :project="p" overlay />
    </div>

    <div v-if="moreLink" class="mt-4 flex justify-center">
      <NuxtLink :to="moreLink" class="btn-purple-outline focus-cyber">{{ moreLabel ?? 'See all' }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'

defineProps<{ items: any[]; moreLink?: string; moreLabel?: string }>()
</script>
