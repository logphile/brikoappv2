<template>
  <div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
      <ProjectCard
        v-for="p in items"
        :key="p.id"
        :project="p"
        overlay
        :view-prefix="viewPrefix"
        :can-delete="canDelete"
        @deleted="$emit('deleted', $event)"
      />
    </div>

    <div v-if="moreLink" class="mt-4 flex justify-center">
      <NuxtLink :to="moreLink" class="btn-outline-ink">{{ moreLabel ?? 'See all' }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'

withDefaults(defineProps<{ items: any[]; moreLink?: string; moreLabel?: string; viewPrefix?: string; canDelete?: boolean }>(), {
  viewPrefix: '/project',
  canDelete: false,
})

defineEmits<{ (e: 'deleted', id: string | number): void }>()
</script>
