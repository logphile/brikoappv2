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

  <!-- Studio overlay style -->
  <div v-else class="group relative rounded-2xl border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-white/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.16)] transition overflow-hidden focus-within:ring-2 focus-within:ring-mint/60">
    <div class="rounded-xl overflow-hidden aspect-square bg-[#1F2A44]">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" :alt="project.title || 'Project preview'"
           loading="lazy" decoding="async"
           class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-white/60 text-sm">No preview</div>
    </div>
    <div class="px-3 pb-3">
      <div class="mt-2 flex items-center gap-2">
        <h3 class="text-[14px] font-medium text-white/90 truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
    <!-- Hover/focus overlay actions -->
    <div class="absolute inset-0 flex items-end p-3 bg-black/0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-hover:bg-black/10 focus-within:bg-black/10 transition">
      <div class="w-full flex items-center justify-center gap-2">
        <NuxtLink :to="`${viewPrefix}/${project.id}`" class="btn-outline-mint !pointer-events-auto">View</NuxtLink>
        <NuxtLink :to="remixPath" class="btn-mint !pointer-events-auto">Remix</NuxtLink>
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

const props = withDefaults(defineProps<{ project: CommunityProject; overlay?: boolean; viewPrefix?: string; remixPath?: string }>(), {
  overlay: false,
  viewPrefix: '/p',
  remixPath: '/mosaic',
})
</script>
