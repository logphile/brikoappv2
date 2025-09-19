<template>
  <NuxtLink :to="`/p/${project.id}`"
    class="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10
           hover:border-mint/40 transition shadow-soft-card hover:shadow-mint-glow/30">
    <div class="aspect-[4/3] bg-black/30 overflow-hidden">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" alt=""
           class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
    </div>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-white/90 truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="text-xs text-white/50">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
      <p v-if="project.owner && (project.owner.username || project.owner.display_name)" class="mt-1 text-xs text-white/60 truncate">
        by {{ project.owner.username || project.owner.display_name }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface OwnerInfo { username?: string | null; display_name?: string | null }
interface CommunityProject {
  id: string | number
  title?: string | null
  cover_url?: string | null
  created_at: string
  owner?: OwnerInfo
}

defineProps<{ project: CommunityProject }>()
</script>
