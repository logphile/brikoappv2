<template>
  <div class="group relative rounded-2xl border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-white/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.16)] transition overflow-hidden">
    <div class="rounded-xl overflow-hidden aspect-square bg-[#1F2A44]">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" alt=""
           class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-white/40 text-sm">No preview</div>
    </div>
    <div class="px-3 pb-3">
      <div class="mt-2 flex items-center gap-2">
        <h3 class="text-[14px] font-medium text-black/80 truncate">{{ project.title || 'Untitled' }}</h3>
        <span class="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-black/5 text-black/60">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
    <!-- Hover overlay actions -->
    <div class="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition">
      <div class="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition">
        <NuxtLink :to="`/p/${project.id}`" class="pointer-events-auto px-3 py-1.5 rounded-2xl text-ink font-medium bg-gradient-to-r from-[#00E5A0] to-[#4FF3C3] shadow-[0_8px_24px_rgba(0,229,160,0.35)] hover:shadow-[0_12px_28px_rgba(0,229,160,0.45)] transition">View</NuxtLink>
        <NuxtLink to="/mosaic" class="pointer-events-auto px-3 py-1.5 rounded-2xl border border-[#00E5A0]/60 text-[#00E5A0] shadow-[0_0_0_1px_rgba(0,229,160,0.25)] hover:shadow-[0_0_20px_rgba(0,229,160,0.35)] transition">Remix</NuxtLink>
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

defineProps<{ project: CommunityProject }>()
</script>
