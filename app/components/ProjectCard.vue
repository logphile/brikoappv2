<template>
  <!-- Default (Gallery) style: full-card link -->
  <NuxtLink v-if="!overlay" :to="`/p/${project.id}`"
    class="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-sm transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_18px_50px_-16px_rgba(0,229,160,.45)]">
    <div class="framed-img aspect-[4/3] bg-black/30">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" alt=""
           class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
    </div>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-white/90 truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="text-xs text-white/50">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
      <p v-if="project.owner && (project.owner.handle || project.owner.display_name)" class="mt-1 text-xs text-white/60 truncate">
        by {{ project.owner.handle ? ('@' + project.owner.handle) : (project.owner.display_name || '@user') }}
      </p>
    </div>
  </NuxtLink>

  <!-- Studio overlay style (Cyberpunk: ivory tile, purple overlay, pink CTA) -->
  <div v-else class="group card-ivory overflow-hidden rounded-2xl">
    <!-- cover -->
    <div class="relative aspect-square overflow-hidden border border-[color:var(--glass-b)] rounded-xl m-3">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" :alt="project.title || 'Project preview'"
           loading="lazy" decoding="async"
           class="w-full h-full object-cover"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-dim text-sm">No preview</div>
      <!-- hover overlay -->
      <div class="absolute inset-0 bg-[rgba(47,48,97,.35)] opacity-0 group-hover:opacity-100 transition"></div>
      <div class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <NuxtLink :to="`/project/${project.id}`" class="btn-purple-outline focus-cyber">View</NuxtLink>
        <NuxtLink :to="`/project/${project.id}?remix=1`" class="btn-pink focus-cyber">Remix</NuxtLink>
      </div>
    </div>
    <!-- meta -->
    <div class="px-3 pb-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="text-[10px] px-2 py-0.5 rounded-full border border-[color:var(--glass-b)] text-dim bg-white/70">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'img-error', id: string | number): void }>()
interface OwnerInfo { handle?: string | null; display_name?: string | null }
interface CommunityProject {
  id: string | number
  title?: string | null
  cover_url?: string | null
  created_at: string
  owner?: OwnerInfo
}

const props = withDefaults(defineProps<{ project: CommunityProject; overlay?: boolean }>(), {
  overlay: false,
})
</script>
