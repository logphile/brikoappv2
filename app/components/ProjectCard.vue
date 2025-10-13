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

  <!-- Studio overlay style: soft card with square preview and hover actions -->
  <article v-else class="card card-hover group relative overflow-hidden">
    <!-- cover -->
    <div class="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
      <img v-if="project.cover_url"
           :src="project.cover_url as string" :alt="project.title || 'Project preview'"
           loading="lazy" decoding="async"
           class="h-full w-full object-cover"
           @error="emit('img-error', project.id)" />
      <div v-else class="h-full w-full grid place-items-center text-black/60 text-sm">No preview</div>

      <!-- hover action cluster -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition pointer-events-auto">
          <NuxtLink :to="`${viewPrefix}/${project.id}`" class="btn-outline-ink !px-2 !py-1 text-xs">View</NuxtLink>
          <NuxtLink :to="`/mosaic?remix=${project.id}`" class="btn-primary !px-2 !py-1 text-xs">Remix</NuxtLink>
        </div>
      </div>
    </div>
    <!-- meta -->
    <div class="px-3 pb-3">
      <h3 class="mt-2 text-base leading-tight font-medium truncate">
        {{ project.title || 'Untitled' }}
      </h3>
      <div class="mt-1 flex items-center gap-2">
        <span class="pill-micro">{{ new Date(project.created_at).toLocaleDateString() }}</span>
      </div>
    </div>
  </article>
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

const props = withDefaults(defineProps<{ project: CommunityProject; overlay?: boolean; viewPrefix?: string }>(), {
  overlay: false,
  viewPrefix: '/project',
})
</script>
